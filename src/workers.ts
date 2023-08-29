class WorkerManager extends CardManager<Meeple> {
   constructor(public game: CreatureConforts) {
      super(game, {
         getId: (card) => `worker-${card.id}`,
         setupDiv: (card: Meeple, div: HTMLElement) => {
            div.classList.add('worker');
            div.classList.add();
            div.dataset.cardId = '' + card.id;
            const color = getColorName(card.type);
            div.dataset.type = color;
         },
         setupFrontDiv: (card: Meeple, div: HTMLElement) => {
            const color = getColorName(card.type);
            div.dataset.type = color;
         },
         isCardVisible: () => true,
         cardWidth: 50,
         cardHeight: 50,
      });
   }
}
