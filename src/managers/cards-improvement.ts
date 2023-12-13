class ImprovementManager extends CardManager<ImprovementCard> {
   private readonly cottages: { [id: string]: LineStock<CottageCard> } = {};

   constructor(public game: CreatureConforts, prefix = 'improvement', modal = false) {
      super(game, {
         getId: (card) => `${prefix}-${card.id}`,
         setupDiv: (card: Card, div: HTMLElement) => {
            div.classList.add('improvement');
            div.dataset.cardId = '' + card.id;
         },
         setupFrontDiv: (card: ImprovementCard, div: HTMLElement) => {
            const card_info: ImprovementType = this.getCardType(card);
            if (!card_info) return;

            div.dataset.type = card.type;
            div.dataset.img = card_info.img.toString();
            div.classList.add('image');

            if (div.getElementsByClassName('title').length !== 0) return;

            div.insertAdjacentHTML('beforeend', `<div class="title">${_(card_info.name)}</div>`);
            if (card_info.gametext) {
               const gametext = this.formatText(_(card_info.gametext));
               div.insertAdjacentHTML(
                  'beforeend',
                  `<div class="gametext-wrapper"><div class="gametext">${gametext}</div></div>`,
               );
            }

            if (card.type_arg) {
               //    game.setTooltip(div.id, this.getTooltip(card));
            }

            if ('type' in card) {
               this.game.addModalToCard(div, `${this.getId(card)}-help-marker`, () =>
                  this.game.modal.displayImprovement(card),
               );
            }

            if (!document.getElementById(`${this.getId(card)}-slot-cottage`) && !modal) {
               div.insertAdjacentHTML(
                  'beforeend',
                  `<div id="${`${this.getId(card)}-slot-cottage`}" class="slot-cottage"></div>`,
               );
               this.cottages[card.id] = new LineStock(
                  this.game.cottageManager,
                  document.getElementById(`${this.getId(card)}-slot-cottage`),
               );

               const cottage = this.game.gamedatas.cottages.improvements.find(
                  (c) => c.location_arg == card.id,
               );
               if (cottage) {
                  this.cottages[card.id].addCard(cottage);
               }
            }

            if (card.location == 'glade' && !modal) {
               const slot = document.querySelector(`#dice-locations [data-slot-id="${card.location_arg}"]`);
               if (slot) {
                  slot.classList.add('slot-dice');
                  this.game.placeOnObjectPos(slot as any, `${this.getId(card)}-slot-cottage`, -54, -3);
               }
            }
         },
         isCardVisible: (card) => 'type' in card,
         cardWidth: 125,
         cardHeight: 125,
      });
   }

   addCottage(card: ImprovementCard, cottage: CottageCard) {
      return this.cottages[card.id].addCard(cottage);
   }

   getCardType(card: ImprovementCard): ImprovementType {
      return this.game.gamedatas.improvement_types[card.type];
   }

   private formatText(rawText: string) {
      if (!rawText) {
         return '';
      }
      const keywords = /::keyword-{([a-zA-Z ]*)}::/gi;
      const type_food = /::type-food::/gi;
      const type_clothing = /::type-clothing::/gi;
      const type_lighting = /::type-lighting::/gi;
      const type_outdoor = /::type-outdoor::/gi;

      let value = rawText
         .replaceAll(keywords, `<span class="keyword">$1</span>`)
         .replaceAll(
            type_food,
            `<span class="type food"><span class="label">${_(
               'Food',
            )}</span><span class="image"></span></span>`,
         )
         .replaceAll(
            type_clothing,
            `<span class="type clothing"><span class="label">${_(
               'Clothing',
            )}</span><span class="image"></span></span>`,
         )
         .replaceAll(
            type_lighting,
            `<span class="type lighting"><span class="label">${_(
               'Lighting',
            )}</span><span class="image"></span></span>`,
         )
         .replaceAll(
            type_outdoor,
            `<span class="type outdoor"><span class="label">${_(
               'Outdoor',
            )}</span><span class="image"></span></span>`,
         );

      return this.game.formatTextIcons(value);
   }
}
