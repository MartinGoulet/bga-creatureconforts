class PreEndGame implements StateHandler {
   private resource_manager?: IResourceManager<IconsType>;
   private toolbar: ToolbarContainer = new ToolbarContainer('stored');
   private toolbarButton: ToolbarContainer = new ToolbarContainer('stored-buttons');
   private stored_resources: Record<number, IconsType[]> = {};
   private available_resources: Record<string, number> = {};

   constructor(private game: CreatureConforts) {}

   onEnteringState(args: any): void {
      for (const resource of ICONS) {
         this.available_resources[resource] = this.game.getCurrentPlayerPanel().counters[resource].getValue();
      }

      const handleSelectionChange = (selection: ConfortCard[]) => {
         if (selection.length === 0) {
            this.resetResourceManager();
            return;
         }
         this.toolbarButton.addContainer();
         this.addResourcesActionButtonAdd();
         this.addResourcesActionButtonCancel();
         this.addResourcesActionButtonReset();
         this.addResourcesManager(selection[0]);
      };

      const { conforts } = this.game.getCurrentPlayerTable();
      const selectableCards = this.getSelectableComfortCards();

      conforts.setSelectionMode('single');
      conforts.setSelectableCards(selectableCards);
      conforts.onSelectionChange = handleSelectionChange;
   }

   onLeavingState(): void {
      const { conforts } = this.game.getCurrentPlayerTable();
      conforts.setSelectionMode('none');
      conforts.onSelectionChange = undefined;
      this.toolbar.removeContainer();
      this.toolbarButton.removeContainer();
   }

   onUpdateActionButtons(args: any): void {
      const handleConfirm = () => {
         this.game.takeAction('confirmStoreResource', {});
      };

      const handleReset = () => {
         for (const resource of ICONS) {
            this.available_resources[resource] = this.game
               .getCurrentPlayerPanel()
               .counters[resource].getValue();
         }
         this.stored_resources = {};
         this.game.getCurrentPlayerTable().conforts.unselectAll();
      };

      this.game.addActionButton('btn_ress', _('Confirm stored resources'), handleConfirm);
      this.game.addActionButtonGray('btn_reset_ress', _('Reset stored resources'), handleReset);
   }

   private index_ress = 0;

   private async moveResources(card_id: number, resources: IconsType[]) {
      const player_id = this.game.getPlayerId();
      const promises: Promise<BgaAnimation<any>>[] = [];
      for (const ress in resources) {
         promises.push(this.animateResource(card_id, ress));
      }

      await Promise.all(promises);
   }

   private animateResource(card_id: number, type: string) {
      this.index_ress += 1;
      const html = `<div id="ress-${this.index_ress}" class="resource-icon" data-type="${type}" style="z-index: 10; position: absolute"></div>`;
      document
         .getElementById(`player-panel-${this.game.getPlayerId()}-icons-${type}-counter`)
         .insertAdjacentHTML('beforeend', html);

      const element = document.getElementById(`ress-${this.index_ress}`);
      const toElement = document.getElementById(`conforts-${44}`);
      const finalTransform = `translate(${90 * Math.random() + 10}px, ${100 * Math.random() + 25}px)`;
      return this.game.confortManager.animationManager.attachWithAnimation(
         new BgaSlideAnimation({ element, finalTransform }),
         toElement,
      );
   }

   private animationMoveResource(player_id: number, resources: { [type: string]: number }[]) {
      const type = 'wood';

      this.index_ress += 1;
      const html = `<div id="ress-${this.index_ress}" class="resource-icon" data-type="${type}" style="z-index: 10; position: absolute"></div>`;
      document
         .getElementById(`player-panel-${player_id}-icons-${type}-counter`)
         .insertAdjacentHTML('beforeend', html);

      const element = document.getElementById(`ress-${this.index_ress}`);
      const toElement = document.getElementById(`conforts-${44}`);
      const finalTransform = `translate(${90 * Math.random() + 10}px, ${100 * Math.random() + 25}px)`;
      this.game.confortManager.animationManager.attachWithAnimation(
         new BgaSlideAnimation({ element, finalTransform }),
         toElement,
      );

      // this.game
      //    .slideToObjectPos(
      //       `ress-${this.index_ress}`,
      //       `conforts-${44}-front`,
      //       50 * Math.random(),
      //       60 & Math.random(),
      //       375,
      //    )
      //    .play();

      // let index = 0;
      // Object.keys(resources).forEach((type) => {
      //    const count = resources[type];
      //    for (let i = 0; i < count; i++) {
      //       const div = `<div class="resource-icon resource-card" data-type="${type}" id=""></div>`;
      //       this.game.place(div, );
      //       this.game.slideTemporaryObject(
      //          `<div class="resource-icon" data-type="${type}"></div>`,
      //          'overall-content', //'left-side-wrapper',
      //          fromElement,
      //          `player-panel-${player_id}-icons-${type}-counter`,
      //          1000,
      //          250 * index++,
      //       );
      //    }
      //    this.game.getPlayerPanel(player_id).counters[type].incValue(count);
      // });
   }

   private addResourcesManager(selection: ConfortCard) {
      const { storable } = this.game.confortManager.getCardType(selection);

      const filter_available = [...storable];
      const available = GOODS.filter((good) => filter_available.includes(good)).map((good) => {
         return {
            resource: good,
            initialValue: this.available_resources[good],
         } as IResourceCounterSettings<IconsType>;
      });

      if (storable) {
         this.resource_manager = new ResourceManagerPayFor<IconsType>(this.toolbar.addContainer(), {
            from: {
               available,
               requirement: storable,
               count: storable.length,
            },
            to: {},
            times: 99,
         });
      } else {
         this.resource_manager = new ResourceManagerPay<IconsType>(this.toolbar.addContainer(), {
            player_resources: available,
            resource_count: 1,
            requirement: ['story'],
         });
      }
   }

   private addResourcesActionButtonAdd() {
      const { conforts } = this.game.getCurrentPlayerTable();
      const handleButtonConfirm = () => {
         if (this.resource_manager.hasTradePending()) {
            this.game.showMessage('You have uncompleted requirement met', 'error');
            return;
         }
         const resources = this.resource_manager.getResourcesFrom();
         resources.forEach((good) => (this.available_resources[good] -= 1));
         const card_id = conforts.getSelection()[0].id;

         if (this.stored_resources[card_id] === undefined) {
            this.stored_resources[card_id] = [...resources];
         } else {
            this.stored_resources[card_id] = [...this.stored_resources[card_id], ...resources];
         }

         this.moveResources(Number(card_id), resources);

         conforts.unselectAll();
      };
      this.game.addActionButton(
         'btn_confirm',
         _('Add resources'),
         handleButtonConfirm,
         this.toolbarButton.getContainer().id,
      );
   }

   private addResourcesActionButtonCancel() {
      const { conforts } = this.game.getCurrentPlayerTable();
      const handleCancel = () => {
         conforts.unselectAll();
      };
      this.game.addActionButton(
         'btn_cancel',
         _('Cancel'),
         handleCancel,
         this.toolbarButton.getContainer().id,
         null,
         'gray',
      );
   }

   private addResourcesActionButtonReset() {
      const handleReset = () => {
         this.resource_manager.reset();
      };
      this.game.addActionButton(
         'btn_reset',
         _('Reset'),
         handleReset,
         this.toolbarButton.getContainer().id,
         null,
         'gray',
      );
   }

   private getSelectableComfortCards() {
      const { conforts, improvements } = this.game.getCurrentPlayerTable();

      const canAddStoryFood: boolean =
         improvements.getCards().filter((card) => {
            return Number(card.type) === 12;
         }).length > 0 || true;

      const canAddStoryClothing: boolean =
         improvements.getCards().filter((card) => {
            return Number(card.type) === 5;
         }).length > 0;

      const selectableCards = conforts.getCards().filter((card) => {
         const type = this.game.confortManager.getCardType(card);
         return (
            type.storable !== undefined ||
            (type.type === 'food' && canAddStoryFood) ||
            (type.type === 'clothing' && canAddStoryClothing)
         );
      });

      return selectableCards;
   }

   private resetResourceManager() {
      this.toolbarButton.removeContainer();
      this.toolbar.removeContainer();
      this.resource_manager?.reset();
      this.resource_manager = null;
   }
}
