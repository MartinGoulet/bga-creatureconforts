class TravelerStripedSkunkStates implements StateHandler {
   constructor(private game: CreatureComforts) {}

   onEnteringState(args: any): void {
      const discard = this.game.tableCenter.confort_discard_line;

      const handleSelectionChanged = (selection: ConfortCard[]) => {
         this.game.toggleButtonEnable('btn_confirm', selection.length === 1);
      };

      discard.setSelectionMode('single');
      discard.onSelectionChange = handleSelectionChanged;
   }

   onLeavingState(): void {
      const discard = this.game.tableCenter.confort_discard_line;
      discard.setSelectionMode('none');
      discard.onSelectionChange = undefined;
   }

   onUpdateActionButtons(args: any): void {
      const handleConfirm = () => {
         const discard = this.game.tableCenter.confort_discard_line;
         if (discard.getSelection().length == 0) return;

         this.game.takeAction('confirmStripedSkunk', {
            card_id: discard.getSelection()[0].id,
         });
      };

      this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirm);
      this.game.addActionButtonPass();
   }
}

interface StipedSkunkStates {}
