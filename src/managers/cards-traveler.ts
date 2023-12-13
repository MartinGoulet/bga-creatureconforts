class TravelerManager extends CardManager<TravelerCard> {
   constructor(public game: CreatureConforts, prefix = 'traveler') {
      super(game, {
         getId: (card) => `${prefix}-${card.id}`,
         setupDiv: (card: Card, div: HTMLElement) => {
            div.classList.add('traveler');
            div.dataset.cardId = '' + card.id;
         },
         setupFrontDiv: (card: Card, div: HTMLElement) => {
            const card_info: TravelerType = this.getCardType(card);
            div.dataset.type = card.type;
            div.dataset.img = '' + card_info.img;
            div.classList.add('image');

            if (div.getElementsByClassName('title').length !== 0) return;

            div.insertAdjacentHTML('beforeend', `<div class="title">${_(card_info.name)}</div>`);
            if (card_info.gametext) {
               const gametext = this.game.formatTextIcons(
                  _(card_info.gametext),
                  ['1', '2', '8'].includes(card.type),
               );
               const fullgametext = `${_(card_info.timing)} • ${gametext}`;
               div.insertAdjacentHTML(
                  'beforeend',
                  `<div class="gametext-wrapper"><div class="gametext">${fullgametext}</div></div>`,
               );
            }

            if (card.type_arg) {
               //    game.setTooltip(div.id, this.getTooltip(card));
            }

            if ('type' in card) {
               this.game.addModalToCard(div, `${this.getId(card)}-help-marker`, () =>
                  this.game.modal.displayTraveler(card),
               );
            }
         },
         isCardVisible: (card) => 'type' in card,
         cardWidth: 212,
         cardHeight: 142,
      });
   }

   getCardType(card: ImprovementCard): TravelerType {
      return this.game.gamedatas.travelers.types[card.type];
   }
}
