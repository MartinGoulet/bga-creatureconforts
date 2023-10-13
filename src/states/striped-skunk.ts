class StripedSkunkStates implements StateHandler {
   constructor(private game: CreatureConforts) {}

   onEnteringState(args: any): void {}

   onLeavingState(): void {}

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

interface StipedSkunkStates {}
