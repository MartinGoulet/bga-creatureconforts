class ResolveWorkshopState implements StateHandler {
   constructor(private game: CreatureConforts) {}

   onEnteringState(args: any): void {
      const { worker_locations, dice_locations, improvement_market: market } = this.game.tableCenter;
      worker_locations.setSelectableLocation([10]);
      worker_locations.setSelectedLocation([10]);

      const die = dice_locations.getDice().find((die: Dice) => die.location == 10);

      market.setSelectionMode('single');
      market.setSelectableCards(
         market.getCards().filter((card) => {
            if (Number(card.location_arg) > die.face) return false;

            let cost = { ...this.game.improvementManager.getCardType(card).cost };
            if (TravelerHelper.isActivePileatedWoodpecker() && 'wood' in cost) {
               cost['wood'] -= 1;
               if (cost['wood'] <= 0) {
                  delete cost['wood'];
               }
            }

            return ResourceRequirement.isRequirementMet(this.game, cost);
         }),
      );
      market.onSelectionChange = (selection: ConfortCard[]) => {
         this.game.toggleButtonEnable('btn_confirm', selection.length == 1);
      };
   }

   onLeavingState(): void {
      const { worker_locations, improvement_market: market } = this.game.tableCenter;
      worker_locations.setSelectedLocation([]);
      market.setSelectionMode('none');
      market.onSelectionChange = null;
   }

   onUpdateActionButtons(args: any): void {
      const handleConfirm = () => {
         const market = this.game.tableCenter.improvement_market;
         if (market.getSelection().length == 0) return;

         this.game.takeAction('resolveWorker', {
            location_id: 10,
            resources: market.getSelection()[0].location_arg,
         });
      };

      this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirm);
      this.game.addActionButtonClientCancel();
   }
}
