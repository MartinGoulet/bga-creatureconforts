class PlayerTurnCraftState implements StateHandler {
   private resourceManager: SelectResources;

   constructor(private game: CreatureConforts) {}

   onEnteringState(args: any): void {
      if (!this.game.isCurrentPlayerActive()) return;
      const resourceManager = new SelectResources(this.game, this.game.getPlayerId());
      this.resourceManager = resourceManager;
      const { hand } = this.game.getCurrentPlayerTable();

      const handleResourceChanged = (resources: string[]) => {
         const [card] = hand.getSelection();
         if (!card || resources.length == 0) {
            this.game.disableButton('btn_craft');
            return;
         }

         const card_type = this.game.confortManager.getCardType(card);
         if ('*' in card_type.cost) {
            this.game.toggleButtonEnable('btn_craft', card_type.cost['*'] == resources.length);
         }
      };

      const handleSelectionChange = (selection: ConfortCard[]) => {
         this.game.toggleButtonEnable('btn_craft', selection.length == 1);
         if (selection.length == 0) return;

         const card_type = this.game.confortManager.getCardType(selection[0]);
         if ('*' in card_type.cost) {
            resourceManager.display(card_type.cost);
            this.game.toggleButtonEnable('btn_craft', false);
         } else {
            resourceManager.hide();
         }
      };

      const selection = hand.getCards().filter((card) => {
         const card_type = this.game.confortManager.getCardType(card);
         if (!card_type.cost) {
            console.warn('No cost for', card_type);
            return false;
         }
         return this.isRequirementMet(card_type.cost);
      });

      this.game.enableButton('btn_pass', selection.length > 0 ? 'red' : 'blue');

      hand.setSelectionMode('single');
      hand.setSelectableCards(selection);
      hand.onSelectionChange = handleSelectionChange;
      resourceManager.OnResourceChanged = handleResourceChanged;
   }
   onLeavingState(): void {}
   onUpdateActionButtons(args: any): void {
      const { hand } = this.game.getCurrentPlayerTable();
      const handleCraft = () => {
         const [card] = hand.getSelection();
         if (!card) return;
         const card_type = this.game.confortManager.getCardType(card);

         if (!this.isRequirementMet(card_type.cost)) {
            this.game.showMessage('Requirement not met', 'error');
         }

         let resources: number[] = [];

         if ('*' in card_type.cost) {
            resources = this.resourceManager.getResources();
         }

         this.game.takeAction('craftConfort', { card_id: card.id, resources: resources.join(';') });
      };
      const handlePass = () => {
         this.game.takeAction('passCraftConfort');
      };

      this.game.addActionButtonDisabled('btn_craft', _('Craft confort'), handleCraft);
      this.game.addActionButtonDisabled('btn_pass', _('Pass'), handlePass);
   }

   isRequirementMet(cost: { [type: string]: number }): boolean {
      const { counters } = this.game.getPlayerPanel(this.game.getPlayerId());

      for (const type of Object.keys(cost)) {
         if (type !== '*' && counters[type].getValue() < cost[type]) {
            return false;
         }
      }

      if ('*' in cost) {
         const total_goods = GOODS.map((type) => counters[type].getValue()).reduce(
            (prev, curr) => prev + curr,
            0,
         );

         const total_cost = Object.keys(cost)
            .filter((type) => GOODS.indexOf(type) >= 0)
            .map((type) => cost[type])
            .reduce((prev, curr) => prev + curr, 0);

         return total_goods >= total_cost;
      }

      return true;
   }
}
