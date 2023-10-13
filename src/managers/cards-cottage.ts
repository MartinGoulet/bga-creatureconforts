class CottageManager extends CardManager<CottageCard> {
   constructor(public game: CreatureConforts) {
      super(game, {
         getId: (card) => `cottage-${card.id}`,
         setupDiv: (card: CottageCard, div: HTMLElement) => {
            div.classList.add('cottage');
            div.dataset.cardId = '' + card.id;
         },
         setupFrontDiv: (card: CottageCard, div: HTMLElement) => {
            div.dataset.type = getColorName(card.type);
         },
         isCardVisible: () => true,
         cardWidth: 60,
         cardHeight: 60,
      });
   }
}
