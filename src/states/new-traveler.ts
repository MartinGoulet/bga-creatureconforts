class NewTravelerState implements StateHandler {
   constructor(private game: CreatureConforts) {}
   onEnteringState(args: TopCardCount<TravelerCard>): void {
      // debugger;
      // const { topCard, count } = args;
      // const { traveler_deck: deck, hidden_traveler: card } = this.game.tableCenter;
      // if (count < 15) {
      //    deck.removeCard(deck.getTopCard());
      //    deck.setCardNumber(count, card);
      // }
      // deck.flipCard(topCard);
   }
   onLeavingState(): void {}
   onUpdateActionButtons(args: any): void {}
}

interface NewTravelerState extends TopCardCount<TravelerCard> {}
