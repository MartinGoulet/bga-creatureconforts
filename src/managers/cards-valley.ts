class ValleyManager extends CardManager<ValleyCard> {
   constructor(public game: CreatureConforts, prefix = 'valley') {
      super(game, {
         getId: (card) => `${prefix}-${card.id}`,
         setupDiv: (card: Card, div: HTMLElement) => {
            div.classList.add('valley');
            div.dataset.cardId = '' + card.id;
            div.classList.add(card.location);
         },
         setupFrontDiv: (card: Card, div: HTMLElement) => {
            div.dataset.type = card.type;
            // div.dataset.pos = '' + (Number(card.type_arg) % 10);
            div.dataset.image_pos = '' + game.gamedatas.valley_types[Number(card.type_arg)].image_pos;
            if (card.type_arg) {
               //    game.setTooltip(div.id, this.getTooltip(card));
            }

            if ('type' in card) {
               this.game.addModalToCard(div, `${this.getId(card)}-help-marker`, () =>
                  this.game.modal.displayValley(card),
               );
            }
         },
         isCardVisible: () => true,
         cardWidth: 250,
         cardHeight: 150,
      });
   }
}
