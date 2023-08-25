class ValleyManager extends CardManager<Valley> {
   constructor(public game: CreatureConforts) {
      super(game, {
         getId: (card) => `valley-${card.id}`,
         setupDiv: (card: Card, div: HTMLElement) => {
            div.classList.add('valley');
            div.dataset.cardId = '' + card.id;
            div.classList.add(card.location);
         },
         setupFrontDiv: (card: Card, div: HTMLElement) => {
            div.dataset.type = card.type;
            div.dataset.pos = card.type_arg;
            if (card.type_arg) {
               //    game.setTooltip(div.id, this.getTooltip(card));
            }
         },
         isCardVisible: () => true,
         cardWidth: 250,
         cardHeight: 150,
      });
   }
}
