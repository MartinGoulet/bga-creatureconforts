class PreEndGame implements StateHandler {
   private resource_manager?: IResourceManager<IconsType>;
   private toolbar: ToolbarContainer = new ToolbarContainer('stored');
   private toolbarButton: ToolbarContainer = new ToolbarContainer('stored-buttons');
   private stored_resources: Record<number, IconsType[]> = {};
   // private available_resources: Record<string, number> = {};
   private index_ress = 0;

   constructor(private game: CreatureComforts) {}

   onEnteringState(args: any): void {
      // for (const resource of ICONS) {
      //    this.available_resources[resource] = this.game.getCurrentPlayerPanel().counters[resource].getValue();
      // }

      const handleSelectionChange = (selection: ConfortCard[]) => {
         this.game.toggleButtonEnable('btn_ress', selection.length === 0);
         this.game.toggleButtonEnable('btn_reset_ress', selection.length === 0, 'gray');
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

      const { comforts } = this.game.getCurrentPlayerTable();
      const selectableCards = this.getSelectableComfortCards();

      comforts.setSelectionMode('single');
      comforts.setSelectableCards(selectableCards);
      comforts.onSelectionChange = handleSelectionChange;
   }

   onLeavingState(): void {
      const { comforts } = this.game.getCurrentPlayerTable();
      comforts.setSelectionMode('none');
      comforts.onSelectionChange = undefined;
      this.toolbar.removeContainer();
      this.toolbarButton.removeContainer();
   }

   onUpdateActionButtons(args: any): void {
      const handleConfirm = () => {
         if (this.toolbar.getContainer()) return;

         const cards = [];

         Object.keys(this.stored_resources).forEach((card_id) => {
            const resources = this.stored_resources[card_id];
            const string = [card_id, ...ResourceHelper.convertToInt(resources)].join(';');
            cards.push(string);
         });

         this.game.takeAction('confirmStoreResource', { info: cards.join('|') });
      };

      const handleReset = () => {
         if (this.toolbar.getContainer()) return;

         // for (const resource of ICONS) {
         //    this.available_resources[resource] = this.game
         //       .getCurrentPlayerPanel()
         //       .counters[resource].getValue();
         // }

         const { counters } = this.game.getCurrentPlayerPanel();

         Object.keys(this.stored_resources).forEach((card_id) => {
            const ress = this.stored_resources[card_id];
            ress.forEach((ress) => {
               counters[ress].incValue(1);
            });
         });
         this.stored_resources = {};
         document.querySelectorAll('.storage.resource-icon').forEach((div) => div.remove());
         this.game.getCurrentPlayerTable().comforts.unselectAll();
      };

      this.game.addActionButton('btn_ress', _('Confirm stored resources'), handleConfirm);
      this.game.addActionButtonGray('btn_reset_ress', _('Reset stored resources'), handleReset);
   }

   private async moveResources(card_id: number, resources: IconsType[]) {
      const promises: Promise<BgaAnimation<any>>[] = [];
      for (const ress in resources) {
         promises.push(this.animateResource(card_id, resources[ress]));
      }

      await Promise.all(promises);
   }

   private animateResource(card_id: number, type: string) {
      this.index_ress += 1;
      const html = `<div id="ress-${this.index_ress}" class="resource-icon storage" data-type="${type}" style="z-index: 10; position: absolute"></div>`;

      const id = `player-panel-${this.game.getPlayerId()}-icons-${type}-counter`;
      document.getElementById(id).insertAdjacentHTML('beforeend', html);

      const element = document.getElementById(`ress-${this.index_ress}`);
      const toElement = document.getElementById(`comforts-${card_id}`);
      const finalTransform = `translate(${60 * Math.random() + 10}px, ${65 * Math.random() + 25}px)`;
      return this.game.confortManager.animationManager.attachWithAnimation(
         new BgaSlideAnimation({ element, finalTransform }),
         toElement,
      );
   }

   private addResourcesManager(selection: ConfortCard) {
      const { storable, class: card_class } = this.game.confortManager.getCardType(selection);

      const filter_available = [...storable];
      const { counters } = this.game.getCurrentPlayerPanel();

      const available = ICONS.filter((icon) => filter_available.includes(icon)).map((icon) => {
         return {
            resource: icon,
            initialValue: counters[icon].getValue(),
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
            times: card_class == 'Lamp' ? 1 : 99,
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
      const { comforts } = this.game.getCurrentPlayerTable();
      const handleButtonConfirm = () => {
         if (this.resource_manager.hasTradePending()) {
            this.game.showMessage('You have uncompleted requirement met', 'error');
            return;
         }
         const { counters } = this.game.getCurrentPlayerPanel();
         const resources = this.resource_manager.getResourcesFrom();
         resources.forEach((good) => counters[good].incValue(-1));
         const card_id = comforts.getSelection()[0].id;

         if (this.stored_resources[card_id] === undefined) {
            this.stored_resources[card_id] = [...resources];
         } else {
            this.stored_resources[card_id] = [...this.stored_resources[card_id], ...resources];
         }

         this.moveResources(Number(card_id), resources);

         comforts.unselectAll();
      };
      this.game.addActionButton(
         'btn_confirm',
         _('Add resources'),
         handleButtonConfirm,
         this.toolbarButton.getContainer().id,
      );
   }

   private addResourcesActionButtonCancel() {
      const { comforts } = this.game.getCurrentPlayerTable();
      const handleCancel = () => {
         comforts.unselectAll();
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
      const { comforts, improvements } = this.game.getCurrentPlayerTable();

      const canAddStoryFood: boolean =
         improvements.getCards().filter((card) => {
            return Number(card.type) === 12;
         }).length > 0;

      const canAddStoryClothing: boolean =
         improvements.getCards().filter((card) => {
            return Number(card.type) === 5;
         }).length > 0;

      const selectableCards = comforts.getCards().filter((card) => {
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
