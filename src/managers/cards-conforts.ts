class ConfortManager extends CardManager<ConfortCard> {
   constructor(public game: CreatureConforts, prefix: string = 'conforts') {
      super(game, {
         getId: (card) => `${prefix}-${card.id}`,
         setupDiv: (card: Card, div: HTMLElement) => {
            div.classList.add('confort');
            div.dataset.cardId = '' + card.id;
         },
         setupFrontDiv: (card: Card, div: HTMLElement) => {
            const card_info: ConfortType = this.getCardType(card);
            if (!card_info) return;
            div.dataset.type = card.type;
            div.dataset.img = card_info.img.toString();

            game.setTooltip(div.id, this.getTooltip(card));

            this.game.addModalToCard(div, `${this.getId(card)}-help-marker`, () =>
               this.game.modal.displayConfort(card),
            );
         },
         isCardVisible: (card) => 'type' in card,
         cardWidth: 110,
         cardHeight: 154,
      });
   }

   markAsSelected(card_id: number) {
      if (card_id > 0) {
         this.getCardElement({ id: card_id.toString() } as ConfortCard).classList.add(
            'bga-cards_selected-card',
         );
      }
   }

   getCardType(card: ConfortCard): ConfortType {
      return this.game.gamedatas.confort_types[card.type];
   }

   getTooltip(card: ConfortCard) {
      const card_type = this.getCardType(card);
      const { name, cost, gametext, score } = card_type;

      const display_cost: string[] = ResourceHelper.convertCostToArray(cost).map((type: IconsType) => {
         return ResourceHelper.getElement<IconsType>(type);
      });
      const display_gametext = gametext ? this.game.formatTextIcons(gametext) : '';

      const html = `<div class="tooltip-card-comfort">
         <div class="tooltip-left">
            <div class="tooltip-header">
               <div class="score"><div class="i-heart"><span>${score}</span></div></div>
               <div class="name">${_(name)}</div>
            </div>
            <div class="tooltip-cost">${display_cost.join('')}</div>
            <div class="tooltip-gametext">${display_gametext}</div>
      </div>`;

      return html;
   }
}
