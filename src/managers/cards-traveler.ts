class TravelerManager extends CardManager<TravelerCard> {
   constructor(public game: CreatureConforts) {
      super(game, {
         getId: (card) => `traveler-${card.id}`,
         setupDiv: (card: Card, div: HTMLElement) => {
            div.classList.add('traveler');
            div.dataset.cardId = '' + card.id;
         },
         setupFrontDiv: (card: Card, div: HTMLElement) => {
            div.dataset.type = card.type;
            div.dataset.pos = card.type_arg;
            if (card.type_arg) {
               //    game.setTooltip(div.id, this.getTooltip(card));
            }

            if ('type' in card) {
               this.game.addModalToCard(div, `${this.getId(card)}-help-marker`, () =>
                  this.game.modal.displayTraveler(card),
               );
            }
         },
         isCardVisible: (card) => 'type' in card,
         cardWidth: 212,
         cardHeight: 142,
      });
   }
}
