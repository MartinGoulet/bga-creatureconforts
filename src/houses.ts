class HouseManager extends CardManager<HouseToken> {
   constructor(public game: CreatureConforts) {
      super(game, {
         getId: (card) => `house-${card.player_id}-${card.token_id}`,
         setupDiv: (card: HouseToken, div: HTMLElement) => {
            div.classList.add('house');
            div.classList.add();
            div.dataset.cardId = '' + card.token_id;
         },
         setupFrontDiv: (card: HouseToken, div: HTMLElement) => {
            div.dataset.type = game.getPlayerTable(card.player_id).player_color;
         },
         isCardVisible: () => true,
         cardWidth: 60,
         cardHeight: 60,
      });
   }
}
