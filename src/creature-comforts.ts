const isDebug =
   window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const debug = isDebug ? console.log.bind(window.console) : function () {};
// const LOCAL_STORAGE_ZOOM_KEY = 'creature-comforts-zoom';
const arrayRange = (start, end) => Array.from(Array(end - start + 1).keys()).map((x) => x + start);
const LOCAL_STORAGE_ZOOM_KEY = 'creature-comforts-zoom';

interface CreatureComforts
   extends ebg.core.gamegui,
      BgaGame<CreatureComfortsPlayerData, CreatureComfortsGamedatas> {
   dontPreloadImage(image_file_name: string): void;
   ensureSpecificGameImageLoading(image_file_names_array: string[]);
   displayScoring(
      anchor_id: string,
      color: string,
      score: number,
      duration: number,
      offset_x?: number,
      offset_y?: number,
   ): void;
   fadeOutAndDestroy(id: string, duration?: number, delay?: number): void;
   showMessage(msg: string, type: 'info' | 'error' | 'only_to_log'): void;
   updatePlayerOrdering(): void;
   removeActionButtons: () => void;
   addTooltip(
      nodeId: string,
      helpStringTranslated: string,
      actionStringTranslated: string,
      delay?: number,
   ): void;
   addTooltipHtmlToClass(cssClass: string, html: string, delay?: number): void;
}

class CreatureComforts
   implements ebg.core.gamegui, BgaGame<CreatureComfortsPlayerData, CreatureComfortsGamedatas>
{
   private TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;

   public confortManager: ComfortManager;
   public confortManagerDiscard: ComfortManager;
   public improvementManager: ImprovementManager;
   public travelerManager: TravelerManager;
   public valleyManager: ValleyManager;

   public diceManager: MyDiceManager;
   public cottageManager: CottageManager;
   public workerManager: WorkerManager;

   public readonly gamedatas: CreatureComfortsGamedatas;
   public notifManager: NotificationManager;
   public stateManager: StateManager;

   public animationManager: AnimationManager;

   public tableCenter: TableCenter;
   public tableScore: TableScore;
   public playersPanels: PlayerPanel[];
   public playersTables: PlayerTable[];
   public zoomManager: ZoomManager;

   public gameOptions: GameOptions;
   public modal: Modal;

   constructor() {}

   /*
        setup:
        
        This method must set up the game user interface according to current game situation specified
        in parameters.
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
        
        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */
   public setup(gamedatas: CreatureComfortsGamedatas) {
      debug(gamedatas);

      this.animationManager = new AnimationManager(this, { duration: 0 });

      this.confortManager = new ComfortManager(this);
      this.confortManagerDiscard = new ComfortManager(this, 'comforts-discard');
      this.improvementManager = new ImprovementManager(this);
      this.travelerManager = new TravelerManager(this);
      this.valleyManager = new ValleyManager(this);

      this.diceManager = new MyDiceManager(this);
      this.cottageManager = new CottageManager(this);
      this.workerManager = new WorkerManager(this);

      this.notifManager = new NotificationManager(this);
      this.stateManager = new StateManager(this);

      this.gameOptions = new GameOptions(this);
      this.tableCenter = new TableCenter(this);
      this.tableScore = new TableScore(this);
      this.modal = new Modal(this);

      ['red', 'yellow', 'green', 'gray', 'purple'].forEach((color) => {
         this.dontPreloadImage(`board_${color}.jpg`);
         this.dontPreloadImage(`dice_${color}.jpg`);
      });

      this.dontPreloadImage('improvements.jpg');

      // Setting up player boards
      this.createPlayerPanels(gamedatas);
      this.createPlayerTables(gamedatas);

      // this.zoomManager = new ZoomManager({
      //    element: document.getElementById('table'),
      //    smooth: false,
      //    zoomControls: {
      //       color: 'white',
      //    },
      //    localStorageZoomKey: LOCAL_STORAGE_ZOOM_KEY,
      //    // onDimensionsChange: () => {
      //    //    const tablesAndCenter = document.getElementById('tables-and-center');
      //    //    const clientWidth = document.getElementById('table').clientWidth;
      //    //    const tablesWidth = Math.max(640 /*, document.getElementById('tables').clientWidth*/);
      //    //    tablesAndCenter.classList.toggle('double-column', clientWidth > 921 + tablesWidth); // 900 + 21 + tablesWidth
      //    // },
      //    // zoomLevels: [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
      // });

      TravelerHelper.setTravelerToTable();

      this.setupNotifications();
   }

   ///////////////////////////////////////////////////
   //// Game & client states

   // onEnteringState: this method is called each time we are entering into a new game state.
   //                  You can use this method to perform some user interface changes at this moment.
   //
   public onEnteringState(stateName: string, args: any) {
      this.stateManager.onEnteringState(stateName, args);
   }

   // onLeavingState: this method is called each time we are leaving a game state.
   //                 You can use this method to perform some user interface changes at this moment.
   //
   public onLeavingState(stateName: string) {
      this.stateManager.onLeavingState(stateName);
   }

   // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
   //                        action status bar (ie: the HTML links in the status bar).
   //
   public onUpdateActionButtons(stateName: string, args: any) {
      this.stateManager.onUpdateActionButtons(stateName, args);
   }

   ///////////////////////////////////////////////////
   //// Utilities

   public addActionButtonDisabled(id: string, label: string, action?: (evt: any) => void) {
      this.addActionButton(id, label, action);
      this.disableButton(id);
   }

   public addActionButtonClientCancel() {
      const handleCancel = (evt: any): void => {
         evt.stopPropagation();
         evt.preventDefault();
         this.restoreGameState();
      };
      this.addActionButtonGray('btnCancelAction', _('Cancel'), handleCancel);
   }

   public addActionButtonPass(notification = false) {
      const handlePass = () => {
         this.takeAction('pass', { notification });
      };
      this.addActionButtonRed('btn_pass', _('Pass'), handlePass);
   }

   public addActionButtonUndo() {
      const handleUndo = () => {
         this.takeAction('undo');
      };
      this.addActionButtonGray('btn_undo', _('Undo'), handleUndo);
   }

   public addActionButtonGray(id: string, label: string, action: (evt: any) => void) {
      this.addActionButton(id, label, action, null, null, 'gray');
   }

   public addActionButtonRed(id: string, label: string, action: () => void) {
      this.addActionButton(id, label, action, null, null, 'red');
   }

   public addActionButtonReset(parent: string, handle: () => void) {
      this.addActionButton('btn_reset', _('Reset'), handle, parent, false, 'gray');
   }

   public addModalToCard(div: HTMLElement, helpMarkerId: string, callback: () => void) {
      if (!document.getElementById(helpMarkerId)) {
         div.insertAdjacentHTML(
            'afterbegin',
            `<div id="${helpMarkerId}" class="help-marker">
                     <i class="fa fa-search" style="color: white"></i>
                  </div>`,
         );

         document.getElementById(helpMarkerId).addEventListener('click', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            callback();
         });
      }
   }

   private createPlayerPanels(gamedatas: CreatureComfortsGamedatas) {
      this.playersPanels = [];
      gamedatas.playerorder.forEach((player_id) => {
         const player = gamedatas.players[Number(player_id)];
         const panel = new PlayerPanel(this, player);
         this.playersPanels.push(panel);
      });
   }

   private createPlayerTables(gamedatas: CreatureComfortsGamedatas) {
      this.playersTables = [];
      gamedatas.playerorder.forEach((player_id) => {
         const player = gamedatas.players[Number(player_id)];
         const table = new PlayerTable(this, player);
         this.playersTables.push(table);
      });
   }

   public toggleButtonEnable(id: string, enabled: boolean, color: 'blue' | 'red' | 'gray' = 'blue'): void {
      if (enabled) {
         this.enableButton(id, color);
      } else {
         this.disableButton(id);
      }
   }

   public disableButton(id: string): void {
      const el = document.getElementById(id);
      if (el) {
         el.classList.remove('bgabutton_blue');
         el.classList.remove('bgabutton_red');
         el.classList.add('bgabutton_disabled');
      }
   }

   public enableButton(id: string, color: 'blue' | 'red' | 'gray' = 'blue'): void {
      const el = document.getElementById(id);
      if (el) {
         el.classList.add(`bgabutton_${color}`);
         el.classList.remove('bgabutton_disabled');
      }
   }

   public getPlayerId(): number {
      return Number(this.player_id);
   }

   public getPlayerPanel(playerId: number): PlayerPanel {
      return this.playersPanels.find((playerPanel) => playerPanel.player_id === playerId);
   }

   public getPlayerTable(playerId: number): PlayerTable {
      return this.playersTables.find((playerTable) => playerTable.player_id === playerId);
   }

   public getCurrentPlayerPanel() {
      return this.getPlayerPanel(this.getPlayerId());
   }

   public getCurrentPlayerTable() {
      return this.getPlayerTable(this.getPlayerId());
   }

   public getPlayerResources(filter: IconsType[] = []): IResourceCounterSettings<IconsType>[] {
      const { counters } = this.getPlayerPanel(this.getPlayerId());
      const { hand } = this.getCurrentPlayerTable();
      const resources = ICONS.map((icon: IconsType) => {
         return {
            resource: icon,
            initialValue: icon == 'card' ? hand.getCards().length : counters[icon].getValue(),
         } as IResourceCounterSettings<IconsType>;
      });

      if (filter.length > 0 && TravelerHelper.isActiveHairyTailedHole()) {
         filter = [...filter, 'coin', 'stone'];
      }

      return filter.length == 0 ? resources : resources.filter((r) => filter.indexOf(r.resource) >= 0);
   }

   async restoreGameState() {
      debug('restoreGameState');
      // this.actionManager.reset();
      await this.stateManager.restoreGameState();
      this.clearSelection();
      this.restoreServerGameState();
   }

   clearSelection() {
      debug('clearSelection');
   }

   public setTooltip(id: string, html: string) {
      this.addTooltipHtml(id, html, this.TOOLTIP_DELAY);
   }

   public takeAction(
      action: string,
      data?: any,
      onSuccess?: (result: any) => void,
      onComplete?: (is_error: boolean) => void,
   ) {
      data = data || {};
      data.lock = true;
      onSuccess = onSuccess ?? function (result: any) {};
      onComplete = onComplete ?? function (is_error: boolean) {};
      (this as any).ajaxcall(
         `/creatureconforts/creatureconforts/${action}.html`,
         data,
         this,
         onSuccess,
         onComplete,
      );
   }

   ///////////////////////////////////////////////////
   //// Reaction to cometD notifications

   /*
        setupNotifications:
        
        In this method, you associate each of your game notifications with your local method to handle it.
        
        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your karmaka.game.php file.
     
    */
   setupNotifications() {
      debug('notifications subscriptions setup');
      this.notifManager.setup();
   }

   ///////////////////////////////////////////////////
   //// Logs

   /* @Override */
   format_string_recursive(log: string, args: any) {
      try {
         if (log.indexOf('::coin::') >= 0) {
            log = log.replaceAll('::coin::', `<div class="resource-icon" data-type="coin"></div>`);
         }

         if (log.indexOf('::story::') >= 0) {
            log = log.replaceAll('::story::', `<div class="resource-icon" data-type="story"></div>`);
         }

         if (log.indexOf('::any::') >= 0) {
            log = log.replaceAll('::any::', `<div class="resource-icon" data-type="*"></div>`);
         }

         if (log && args && !args.processed) {
            args.processed = true;

            if (args.card_name !== undefined) {
               args.card_name = '<b>' + _(args.card_name) + '</b>';
            }

            if (args.rolledDice !== undefined) {
               args.rolledDice = this.formatTextDice(args.player_id, args.rolledDice);
            }

            if (args.resources_from !== undefined) {
               args.resources_from = this.formatResourceIcons(args.resources_from);
            }

            if (args.resources_to !== undefined) {
               args.resources_to = this.formatResourceIcons(args.resources_to);
            }

            if (args.nbr_cards !== undefined) {
               args.nbr_cards = `<div class="cc-icon i-cards"><span>${args.nbr_cards}</span></div>`;
            }

            if (args.die_from !== undefined) {
               const value = args.die_from;
               const color = args.die_color == 'white' ? 'white' : getColorName(args.die_color);
               args.die_from = this.getDiceLog(value, color);
            }

            if (args.die_to !== undefined) {
               const value = args.die_to;
               const color = args.die_color == 'white' ? 'white' : getColorName(args.die_color);
               args.die_to = this.getDiceLog(value, color);
            }

            if (args.token !== undefined) {
               args.token = `<div class="${args.token}"></div>`;
            }
         }
      } catch (e) {
         console.error(log, args, 'Exception thrown', e.stack);
      }

      return this.inherited(arguments);
   }

   private getDiceLog(value: string, color: string): string {
      return `<div class="dice-icon-log bga-dice_die colored-die" data-color="${color}"><div class="bga-dice_die-face" data-face="${value}"><span>${value}</span></div></div>`;
   }

   formatTextDice(player_id: number, rawText: string) {
      if (!rawText) return '';

      const dice = rawText.split(',');
      let values = [];

      const color = dice.length == 2 ? this.getPlayerTable(player_id).player_color : 'white';

      dice.forEach((value: string) => {
         values.push(this.getDiceLog(value, color));
      });

      return values.join('');
   }

   formatResourceIcons(group: { [type: string]: number }[]) {
      let values = [];

      Object.keys(group).forEach((icon: string) => {
         for (let index = 0; index < group[icon]; index++) {
            values.push(`<div class="resource-icon" data-type="${icon}"></div>`);
         }
      });

      return values.join('');
   }

   formatTextIcons(rawText: string, groupResources = false) {
      if (!rawText) {
         return '';
      }
      const generic_icons = /::(\w+)::/gi;
      const generic_digit_icons = /::(\w+)-(\S+)::/gi;

      let value = rawText
         .replaceAll(generic_icons, '<div class="resource-icon" data-type="$1"></div>')
         .replaceAll(generic_digit_icons, '<div class="i-$1"><span>$2</span></div>');

      if (groupResources) {
         const firstDiv = value.indexOf('<div class="resource-icon"');
         const lastDiv = value.lastIndexOf('<div class="resource-icon"');
         if (firstDiv !== lastDiv) {
            value = value.substring(0, firstDiv) + `<div class="resource-group">` + value.substring(firstDiv);
            const lastEndDiv = value.lastIndexOf('</div>');
            value = value.substring(0, lastEndDiv) + `</div>` + value.substring(lastEndDiv);
         }
      }

      return value;
   }
}
