class PlayerTurnDiscardState implements StateHandler {
   private cards: ConfortCard[];

   constructor(private game: CreatureComforts) {}

   onEnteringState(args: PlayerTurnDiscard): void {
      if (!this.game.isCurrentPlayerActive()) return;

      this.cards = [];
      const { hand } = this.game.getCurrentPlayerTable();

      const handleSelection = (selection: ConfortCard[], lastChanged: ConfortCard) => {
         this.game.toggleButtonEnable('btn_discard', selection.length == args.nbr);
         if (selection.length > args.nbr) {
            hand.unselectCard(lastChanged);
         }
      };

      hand.setSelectionMode('multiple');
      hand.onSelectionChange = handleSelection;
   }
   onLeavingState(): void {
      const { hand } = this.game.getCurrentPlayerTable();
      hand.setSelectionMode('none');
      hand.onSelectionChange = null;
   }
   onUpdateActionButtons(args: PlayerTurnDiscard): void {
      const handleDiscard = () => {
         const { hand } = this.game.getCurrentPlayerTable();
         if (hand.getSelection().length !== args.nbr) return;

         const card_ids = hand
            .getSelection()
            .map((card) => card.id)
            .join(';');
         this.game.takeAction('discardConfort', { card_ids });
      };

      this.game.addActionButtonDisabled('btn_discard', _('Discard'), handleDiscard);
   }
}

interface PlayerTurnDiscard {
   nbr: number;
}
