const isDebug =
   window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const debug = isDebug ? console.log.bind(window.console) : function () {};
// const LOCAL_STORAGE_ZOOM_KEY = 'creature-conforts-zoom';
const arrayRange = (start, end) => Array.from(Array(end - start + 1).keys()).map((x) => x + start);

const GOODS = ['wood', 'stone', 'fruit', 'mushroom', 'yarn', 'grain'];
const ICONS = ['wood', 'stone', 'fruit', 'mushroom', 'yarn', 'grain', 'lesson', 'story', 'coin'];

interface CreatureConforts
   extends ebg.core.gamegui,
      BgaGame<CreatureConfortsPlayerData, CreatureConfortsGamedatas> {
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
   addTooltip(
      nodeId: string,
      helpStringTranslated: string,
      actionStringTranslated: string,
      delay?: number,
   ): void;
   addTooltipHtmlToClass(cssClass: string, html: string, delay?: number): void;
}

class CreatureConforts
   implements ebg.core.gamegui, BgaGame<CreatureConfortsPlayerData, CreatureConfortsGamedatas>
{
   private TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;

   public confortManager: ConfortManager;
   public improvementManager: ImprovementManager;
   public travelerManager: TravelerManager;
   public valleyManager: ValleyManager;

   public diceManager: MyDiceManager;
   public cottageManager: CottageManager;
   public workerManager: WorkerManager;

   public readonly gamedatas: CreatureConfortsGamedatas;
   public notifManager: NotificationManager;
   public stateManager: StateManager;

   public tableCenter: TableCenter;
   public playersPanels: PlayerPanel[];
   public playersTables: PlayerTable[];
   // public zoomManager: ZoomManager;

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
   public setup(gamedatas: CreatureConfortsGamedatas) {
      debug(gamedatas);

      this.confortManager = new ConfortManager(this);
      this.improvementManager = new ImprovementManager(this);
      this.travelerManager = new TravelerManager(this);
      this.valleyManager = new ValleyManager(this);

      this.diceManager = new MyDiceManager(this);
      this.cottageManager = new CottageManager(this);
      this.workerManager = new WorkerManager(this);

      this.notifManager = new NotificationManager(this);
      this.stateManager = new StateManager(this);

      this.tableCenter = new TableCenter(this);

      ['red', 'yellow', 'green', 'gray', 'purple'].forEach((color) => {
         this.dontPreloadImage(`board_${color}.jpg`);
         this.dontPreloadImage(`dice_${color}.jpg`);
      });

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
      //    onDimensionsChange: () => {
      //       const tablesAndCenter = document.getElementById('tables-and-center');
      //       const clientWidth = document.getElementById('table').clientWidth;
      //       const tablesWidth = Math.max(640 /*, document.getElementById('tables').clientWidth*/);
      //       tablesAndCenter.classList.toggle('double-column', clientWidth > 921 + tablesWidth); // 900 + 21 + tablesWidth
      //    },
      //    // zoomLevels: [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
      // });

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

   public addActionButtonPass() {
      const handlePass = () => {
         this.takeAction('pass');
      };
      this.addActionButtonRed('btn_pass', _('Pass'), handlePass);
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

   private createPlayerPanels(gamedatas: CreatureConfortsGamedatas) {
      this.playersPanels = [];
      gamedatas.playerorder.forEach((player_id) => {
         const player = gamedatas.players[Number(player_id)];
         const panel = new PlayerPanel(this, player);
         this.playersPanels.push(panel);
      });
   }

   private createPlayerTables(gamedatas: CreatureConfortsGamedatas) {
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

   public getCurrentPlayerTable() {
      return this.getPlayerTable(this.getPlayerId());
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
         }
      } catch (e) {
         console.error(log, args, 'Exception thrown', e.stack);
      }
      try {
         return this.inherited(arguments);
      } catch {
         debugger;
      }
   }

   formatTextDice(player_id: number, rawText: string) {
      if (!rawText) return '';

      const dice = rawText.split(',');
      let values = [];

      const color = dice.length == 2 ? this.getPlayerTable(player_id).player_color : 'white';

      dice.forEach((value: string) => {
         values.push(
            `<div class="dice-icon-log bga-dice_die colored-die bga-dice_die-face" data-face="${value}" data-color="${color}"><span>${value}<span></div>`,
         );
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
}
