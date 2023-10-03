class PlayerTurnCraftState implements StateHandler {
   // private resourceManager: SelectResources;
   private resourceManager?: ResourceConverter;

   constructor(private game: CreatureConforts) {}

   onEnteringState(args: any): void {
      if (!this.game.isCurrentPlayerActive()) return;
      const worker_locations = this.game.tableCenter.worker_locations;
      worker_locations.setSelectionMode('none');
      worker_locations.setSelectableLocation([]);
      worker_locations.setSelectedLocation([]);

      const { hand } = this.game.getCurrentPlayerTable();

      // const handleResourceChanged = (resources: string[]) => {
      //    const [card] = hand.getSelection();
      //    if (!card || resources.length == 0) {
      //       this.game.disableButton('btn_craft');
      //       return;
      //    }

      //    const card_type = this.game.confortManager.getCardType(card);
      //    if ('*' in card_type.cost) {
      //       this.game.toggleButtonEnable('btn_craft', card_type.cost['*'] == resources.length);
      //    }
      // };

      const handleSelectionChange = (selection: ConfortCard[]) => {
         if (this.resourceManager) {
            this.resourceManager.hide();
            this.resourceManager.OnEnableConfirm = null;
            this.resourceManager = undefined;
         }
         if (selection.length == 0) return;

         const card_type = this.game.confortManager.getCardType(selection[0]);

         if ('*' in card_type.cost) {
            this.resourceManager = new ResourceConverter(this.game, ['*', '*'], [], 1, {
               displayTo: false,
            });
            this.resourceManager.show();
            this.resourceManager.OnEnableConfirm = (enable) => {
               this.game.toggleButtonEnable('btn_craft', enable);
            };
            this.game.toggleButtonEnable('btn_craft', false);
         } else {
            this.game.toggleButtonEnable('btn_craft', selection.length == 1);
         }
      };

      const selection = hand.getCards().filter((card) => {
         const card_type = this.game.confortManager.getCardType(card);
         if (!card_type.cost) {
            console.warn('No cost for', card_type);
            return false;
         }
         return ResourceHelper.isRequirementMet(this.game, card_type.cost);
      });

      this.game.enableButton('btn_pass', selection.length > 0 ? 'red' : 'blue');

      hand.setSelectionMode('single');
      hand.setSelectableCards(selection);
      hand.onSelectionChange = handleSelectionChange;
      // resourceManager.OnResourceChanged = handleResourceChanged;
   }
   onLeavingState(): void {}
   onUpdateActionButtons(args: any): void {
      const { hand } = this.game.getCurrentPlayerTable();
      const handleCraft = () => {
         const [card] = hand.getSelection();
         if (!card) return;
         const card_type = this.game.confortManager.getCardType(card);

         if (!ResourceHelper.isRequirementMet(this.game, card_type.cost)) {
            this.game.showMessage('Requirement not met', 'error');
         }

         let resources: number[] = [];

         if ('*' in card_type.cost) {
            resources = ResourceHelper.convertToInt(this.resourceManager.getResourcesGive());
         }

         this.game.takeAction('craftConfort', { card_id: card.id, resources: resources.join(';') });
      };
      const handlePass = () => {
         this.game.takeAction('passCraftConfort');
      };

      this.game.addActionButtonDisabled('btn_craft', _('Craft confort'), handleCraft);
      this.game.addActionButtonDisabled('btn_pass', _('Pass'), handlePass);
      this.game.addActionButtonUndo();
   }
}
