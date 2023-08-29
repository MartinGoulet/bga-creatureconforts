class CottageManager extends CardManager<Cottage> {
   constructor(public game: CreatureConforts) {
      super(game, {
         getId: (card) => `cottage-${card.player_id}-${card.token_id}`,
         setupDiv: (card: Cottage, div: HTMLElement) => {
            div.classList.add('cottage');
            div.classList.add();
            div.dataset.cardId = '' + card.token_id;
         },
         setupFrontDiv: (card: Cottage, div: HTMLElement) => {
            const color = getColorName(game.gamedatas.players[card.player_id].color);
            div.dataset.type = color;
         },
         isCardVisible: () => true,
         cardWidth: 60,
         cardHeight: 60,
      });
   }
}
