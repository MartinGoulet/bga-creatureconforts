class ImprovementManager extends CardManager<ImprovementCard> {
   private readonly cottages: { [id: string]: LineStock<CottageCard> } = {};

   constructor(public game: CreatureConforts) {
      super(game, {
         getId: (card) => `improvement-${card.id}`,
         setupDiv: (card: Card, div: HTMLElement) => {
            div.classList.add('improvement');
            div.dataset.cardId = '' + card.id;
         },
         setupFrontDiv: (card: ImprovementCard, div: HTMLElement) => {
            div.dataset.type = card.type;
            div.dataset.pos = card.type_arg;
            if (card.type_arg) {
               //    game.setTooltip(div.id, this.getTooltip(card));
            }

            if ('type' in card) {
               this.game.addModalToCard(div, `${this.getId(card)}-help-marker`, () =>
                  this.game.modal.displayImprovement(card),
               );
            }

            if (!document.getElementById(`${this.getId(card)}-slot-cottage`)) {
               div.insertAdjacentHTML(
                  'beforeend',
                  `<div id="${`${this.getId(card)}-slot-cottage`}" class="slot-cottage"></div>`,
               );
               this.cottages[card.id] = new LineStock(
                  this.game.cottageManager,
                  document.getElementById(`${this.getId(card)}-slot-cottage`),
               );
            }

            const cottage = this.game.gamedatas.cottages.improvements.find((c) => c.location_arg == card.id);
            if (cottage) {
               this.cottages[card.id].addCard(cottage);
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
}
