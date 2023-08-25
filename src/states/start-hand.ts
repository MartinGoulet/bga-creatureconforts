class StartHandState implements StateHandler {
   public isMultipleActivePlayer: boolean = true;

   constructor(private game: CreatureConforts) {}

   onEnteringState(args: StartHandStateArgs): void {
      const { hand } = this.game.getCurrentPlayerTable();

      this.game.confortManager.markAsSelected(args._private?.card_id ?? 0);

      if (!this.game.isCurrentPlayerActive()) return;

      const handleSelection = (selection: Confort[]) => {
         this.game.toggleButtonEnable('btn_discard', selection.length == 1);
      };

      hand.setSelectionMode('single');
      hand.onSelectionChange = handleSelection;
   }
   onLeavingState(): void {
      const { hand } = this.game.getCurrentPlayerTable();
      hand.setSelectionMode('none');
      hand.onSelectionChange = null;
   }
   onUpdateActionButtons(args: StartHandStateArgs): void {
      const handleDiscardComplete = () => {
         const { hand } = this.game.getCurrentPlayerTable();
         const selection = hand.getSelection();
         hand.setSelectionMode('none');
         hand.onSelectionChange = null;
         if (selection.length == 1) {
            this.game.confortManager.markAsSelected(Number(selection[0].id));
         }
      };

      const handleDiscard = () => {
         const selection = this.game.getCurrentPlayerTable().hand.getSelection();
         if (selection.length !== 1) return;

         this.game.takeAction('discardStartHand', { card_id: selection[0].id }, handleDiscardComplete);
      };

      const handleCancel = () => {
         this.game.takeAction('cancelStartHand', {}, null, () => {
            this.game.restoreGameState();
         });
      };

      if (!this.game.isSpectator) {
         this.game.addActionButtonDisabled('btn_discard', 'Discard', handleDiscard);
         this.game.addActionButtonGray('btn_cancel', 'Cancel', handleCancel);
      }
   }
}

interface StartHandStateArgs {
   _private?: {
      card_id: number;
   };
}
