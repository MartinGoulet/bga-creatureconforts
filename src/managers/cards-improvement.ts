class ImprovementManager extends CardManager<ImprovementCard> {
   private readonly cottages: { [id: string]: LineStock<CottageCard> } = {};

   constructor(public game: CreatureComforts, prefix = 'improvement', modal = false) {
      super(game, {
         getId: (card) => `${prefix}-${card.id}`,
         setupDiv: (card: Card, div: HTMLElement) => {
            div.classList.add('improvement');
            div.dataset.cardId = '' + card.id;
            const cottage = this.game.gamedatas.cottages.improvements.find((c) => c.location_arg == card.id);
            if (cottage) {
               div.dataset.owner = cottage.type_arg;
            }
         },
         setupFrontDiv: (card: ImprovementCard, div: HTMLElement) => {
            const card_info: ImprovementType = this.getCardType(card);
            if (!card_info) return;

            div.dataset.type = card.type;
            div.dataset.img = card_info.img.toString();

            if (div.getElementsByClassName('title').length === 0) {
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
                  // div.parentElement.parentElement.dataset.owner = cottage.type_arg;
                  this.cottages[card.id].addCard(cottage);
               }
            }

            if (card.location == 'glade' && !modal) {
               setTimeout(() => {
                  const slot = this.game.tableCenter.dice_locations.addSlotElement(card.location_arg);
                  slot.classList.add('slot-dice');
                  div.appendChild(slot);
                  this.game.tableCenter.dice_locations.bindSlotClick(slot, card.location_arg);
               }, 10);
            }
         },
         isCardVisible: (card) => 'type' in card,
         cardWidth: 125,
         cardHeight: 125,
      });
   }

   addCottage(card: ImprovementCard, cottage: CottageCard) {
      this.getCardElement(card).dataset.owner = cottage.type_arg;
      return this.cottages[card.id].addCard(cottage);
   }

   getCardType(card: ImprovementCard): ImprovementType {
      return this.game.gamedatas.improvement_types[card.type];
   }

   isOwner(card: ImprovementCard, player_id: number) {
      return this.getCardElement(card).dataset.owner == player_id.toString();
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

      const getTypeTemplate = (text: string) =>
         `<span class="type food"><span class="label">${text}</span><span class="image"></span></span>`;

      let value = rawText
         .replaceAll(keywords, `<span class="keyword">$1</span>`)
         .replaceAll(type_food, getTypeTemplate(_('Food')))
         .replaceAll(type_clothing, getTypeTemplate(_('Clothing')))
         .replaceAll(type_lighting, getTypeTemplate(_('Lighting')))
         .replaceAll(type_outdoor, getTypeTemplate(_('Outdoor')));

      return this.game.formatTextIcons(value);
   }
}
