class ImprovementManager extends CardManager<Improvement> {
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
         },
         isCardVisible: () => true,
         cardWidth: 125,
         cardHeight: 125,
      });
   }
}
