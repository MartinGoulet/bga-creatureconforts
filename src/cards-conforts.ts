class ConfortManager extends CardManager<ConfortCard> {
   constructor(public game: CreatureConforts) {
      super(game, {
         getId: (card) => `conforts-${card.id}`,
         setupDiv: (card: Card, div: HTMLElement) => {
            div.classList.add('confort');
            div.dataset.cardId = '' + card.id;
         },
         setupFrontDiv: (card: Card, div: HTMLElement) => {
            div.dataset.type = card.type;
            div.dataset.pos = card.type_arg;
            div.classList.toggle('background_1', Number(card.type) <= 12);
            div.classList.toggle('background_2', Number(card.type) > 12 && Number(card.type) <= 24);
            if (card.type_arg) {
               //    game.setTooltip(div.id, this.getTooltip(card));
            }

            this.game.addModalToCard(div, `${this.getId(card)}-help-marker`, () =>
               this.game.modal.displayConfort(card),
            );
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

   getCardType(card: ConfortCard): ConfortType {
      return this.game.gamedatas.confort_types[card.type];
   }
}
