class FamilyDiceState implements StateHandler {
   constructor(private game: CreatureConforts) {}
   onEnteringState(args: any): void {
      const { topCard, count } = args;
      const { traveler_deck: deck, hidden_traveler: card } = this.game.tableCenter;
      if (count < 15) {
         deck.removeCard(deck.getTopCard());
         deck.setCardNumber(count, { id: topCard.id } as TravelerCard);
      }
      deck.flipCard(topCard, { updateData: true, updateFront: true });
   }
   onLeavingState(): void {}
   onUpdateActionButtons(args: any): void {}
}

interface FamilyDiceStateArgs {
   dice: Dice[];
}
