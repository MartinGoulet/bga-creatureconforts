class TravelerGrayWolfState implements StateHandler {
   constructor(private game: CreatureConforts) {}

   onEnteringState(args: any): void {
      const { confort_market: market } = this.game.tableCenter;

      market.setSelectionMode('single');
      market.setSelectableCards(market.getCards());
      market.onSelectionChange = (selection: ConfortCard[]) => {
         this.game.toggleButtonEnable('btn_confirm', selection.length == 1);
      };
   }

   onLeavingState(): void {
      const market = this.game.tableCenter.confort_market;
      market.setSelectionMode('none');
      market.onSelectionChange = null;
   }

   onUpdateActionButtons(args: any): void {
      const handleConfirm = () => {
         const market = this.game.tableCenter.confort_market;
         if (market.getSelection().length == 0) return;

         this.game.takeAction('confirmGrayWolf', {
            slot_id: market.getSelection()[0].location_arg,
         });
      };

      this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirm);
   }
}
