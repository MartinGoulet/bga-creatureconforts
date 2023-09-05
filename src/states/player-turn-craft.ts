class PlayerTurnCraftState implements StateHandler {
   private resourceManager: ChooseResource;

   constructor(private game: CreatureConforts) {}

   onEnteringState(args: any): void {
      if (!this.game.isCurrentPlayerActive()) return;
      this.resourceManager = new ChooseResource(this.game, this.game.getPlayerId());
      const { hand } = this.game.getCurrentPlayerTable();

      const handleSelectionChange = (selection: ConfortCard[]) => {
         this.game.toggleButtonEnable('btn_craft', selection.length == 1);
         if (selection.length == 0) return;

         const card_type = this.game.confortManager.getCardType(selection[0]);
         if ('*' in card_type.cost) {
            this.resourceManager.display(card_type.cost);
            this.game.toggleButtonEnable('btn_craft', false);
         } else {
            this.resourceManager.hide();
         }
      };

      const selection = hand.getCards().filter((card) => {
         const card_type = this.game.confortManager.getCardType(card);
         if (!card_type.cost) {
            console.warn('No cost for', card_type);
            return false;
         }
         if ('*' in card_type.cost) {
            return true;
         } else {
            const res = this.isRequirementMet(card_type.cost);
            return res;
         }
      });

      this.game.enableButton('btn_pass', selection.length > 0 ? 'red' : 'blue');

      hand.setSelectionMode('single');
      hand.setSelectableCards(selection);
      hand.onSelectionChange = handleSelectionChange;
   }
   onLeavingState(): void {}
   onUpdateActionButtons(args: any): void {
      const { hand } = this.game.getCurrentPlayerTable();
      const handleCraft = () => {
         const [card] = hand.getSelection();
         if (!card) return;
         const card_type = this.game.confortManager.getCardType(card);
         const resources = [0, 0, 0, 0, 0, 0];
         this.game.takeAction('craftConfort', { card_id: card.id, resources });
      };
      const handlePass = () => {
         this.game.takeAction('passCraftConfort');
      };

      this.game.addActionButtonDisabled('btn_craft', _('Craft confort'), handleCraft);
      this.game.addActionButtonDisabled('btn_pass', _('Pass'), handlePass);
   }

   // displayChooseResources(cost: { [type: string]: number }) {
   //    let zone = document.getElementById(`choose_resources`);
   //    zone?.remove();

   //    const icons = ['wood', 'stone', 'fruit', 'mushroom', 'yarn', 'grain'];

   //    const templateIcon = `<div class="wrapper">
   //       <span id="icons-{icon-value}-counter" class="counter">1</span>
   //       <div class="resource-icon" data-type="{icon-value}"></div>
   //    </div>`;

   //    const html = `<div id="choose_resources">
   //       ${icons.map((icon) => templateIcon.replaceAll('{icon-value}', icon)).join(' ')}
   //    </div>`;

   //    document.getElementById(``);
   // }

   isRequirementMet(cost: { [type: string]: number }): boolean {
      const { counters } = this.game.getPlayerPanel(this.game.getPlayerId());

      for (const type of Object.keys(cost)) {
         if (type !== '*' && counters[type].getValue() < cost[type]) {
            return false;
         }
      }

      if ('*' in cost) {
         const goods = ['wood', 'stone', 'fruit', 'mushroom', 'yarn', 'grain'];
         const total_goods = goods
            .map((type) => counters[type].getValue())
            .reduce((prev, curr) => prev + curr, 0);

         const total_cost = Object.keys(cost)
            .map((type) => cost[type])
            .reduce((prev, curr) => prev + curr, 0);

         return total_goods >= total_cost;
      }

      return true;
   }
}
