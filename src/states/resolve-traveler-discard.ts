class ResolveTravelerDiscardState implements StateHandler {
   constructor(private game: CreatureConforts) {}

   onEnteringState(args: ResolveTravelerDiscardArgs): void {
      const { hand } = this.game.getCurrentPlayerTable();

      const handleSelectionChange = (selection: ConfortCard[]) => {
         this.game.toggleButtonEnable('btn_confirm', selection.length == args.count, 'blue');
      };

      hand.setSelectionMode('multiple');
      hand.onSelectionChange = handleSelectionChange;
   }
   onLeavingState(): void {
      const { hand } = this.game.getCurrentPlayerTable();
      hand.setSelectionMode('none');
      hand.onSelectionChange = undefined;
   }
   onUpdateActionButtons(args: ResolveTravelerDiscardArgs): void {
      const { hand } = this.game.getCurrentPlayerTable();

      const handleConfirm = () => {
         if (hand.getSelection().length !== args.count) return;

         const card_ids = hand
            .getSelection()
            .map((card) => card.id)
            .join(';');

         this.game.takeAction(args.action, { ...args.data, card_ids });
      };
      this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirm);
      this.game.addActionButtonClientCancel();
   }
}

interface ResolveTravelerDiscardArgs {
   action: string;
   data: any;
   count: number;
}
