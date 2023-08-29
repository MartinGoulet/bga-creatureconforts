class ConfortManager extends CardManager<ConfortCard> {
   constructor(public game: CreatureConforts) {
      super(game, {
         getId: (card) => `conforts-${card.id}`,
         setupDiv: (card: Card, div: HTMLElement) => {
            div.classList.add('confort');
            div.dataset.cardId = '' + card.id;
            div.classList.add(Number(card.type) <= 12 ? 'background_1' : 'background_2');
         },
         setupFrontDiv: (card: Card, div: HTMLElement) => {
            div.dataset.type = card.type;
            div.dataset.pos = card.type_arg;
            if (card.type_arg) {
               //    game.setTooltip(div.id, this.getTooltip(card));
            }
         },
         isCardVisible: (card) => 'type' in card,
         cardWidth: 110,
         cardHeight: 154,
      });
   }

   markAsSelected(card_id: number) {
      if (card_id > 0) {
         this.getCardElement({ id: card_id.toString() } as ConfortCard).classList.add(
            'bga-cards_selected-card',
         );
      }
   }
}
