class ImprovementManager extends CardManager<ImprovementCard> {
   constructor(public game: CreatureConforts) {
      super(game, {
         getId: (card) => `improvement-${card.id}`,
         setupDiv: (card: Card, div: HTMLElement) => {
            div.classList.add('improvement');
            div.dataset.cardId = '' + card.id;
         },
         setupFrontDiv: (card: Card, div: HTMLElement) => {
            div.dataset.type = card.type;
            div.dataset.pos = card.type_arg;
            if (card.type_arg) {
               //    game.setTooltip(div.id, this.getTooltip(card));
            }

            this.game.addModalToCard(div, `${this.getId(card)}-help-marker`, () =>
               this.game.modal.displayImprovement(card),
            );
         },
         isCardVisible: (card) => 'type' in card,
         cardWidth: 125,
         cardHeight: 125,
      });
   }

   getCardType(card: ImprovementCard): ImprovementType {
      return this.game.gamedatas.improvement_types[card.type];
   }
}
