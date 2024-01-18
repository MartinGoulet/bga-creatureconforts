class ValleyManager extends CardManager<ValleyCard> {
   constructor(public game: CreatureComforts, prefix = 'valley') {
      super(game, {
         getId: (card) => `${prefix}-${card.id}`,
         setupDiv: (card: Card, div: HTMLElement) => {
            div.classList.add('valley');
            div.dataset.cardId = '' + card.id;
            div.classList.add(card.location);
         },
         setupFrontDiv: (card: Card, div: HTMLElement) => {
            div.dataset.type = card.type;
            // div.dataset.pos = '' + (Number(card.type_arg) % 10);
            div.dataset.image_pos = '' + game.gamedatas.valley_types[Number(card.type_arg)].image_pos;
            if (card.type_arg) {
               //    game.setTooltip(div.id, this.getTooltip(card));
            }
            if (div.getElementsByClassName('dice-rule').length !== 0) return;

            const card_info: ValleyType = game.gamedatas.valley_types[Number(card.type_arg)];
            for (const pos of [1, 2, 3, 4]) {
               if (card_info.position[pos] && card_info.position[pos].rule) {
                  div.insertAdjacentHTML(
                     'beforeend',
                     `<div class="dice-rule" data-pos="${pos}">${this.getTextRule(
                        card_info.position[pos].rule,
                     )}</div>`,
                  );
               }
            }

            if ('type' in card) {
               this.game.addModalToCard(
                  div,
                  `${this.getId(card)}-help-marker`,
                  () => this.game.modal.displayValley(card),
                  'black',
               );
            }
         },
         isCardVisible: () => true,
         cardWidth: 250,
         cardHeight: 150,
      });
   }
   getTextRule(rule: string) {
      const rules = {
         '3_OR_UNDER': _('OR UNDER'),
         '4_OR_HIGHER': _('OR HIGHER'),
         TOTAL_5_OR_LOWER: _('TOTAL 5 OR_LOWER'),
         TOTAL_6_OR_LOWER: _('TOTAL 6 OR LOWER'),
         TOTAL_7_OR_HIGHER: _('TOTAL 7 OR HIGHER'),
         TOTAL_10_OR_HIGHER: _('TOTAL_10 OR HIGHER'),
         TOTAL_11_OR_HIGHER: _('TOTAL_11 OR HIGHER'),
         TOTAL_7: _('TOTAL 7'),
         TOTAL_8: _('TOTAL 8'),
         // SAME_VALUE: '',
         ALL_EVEN: _('ALL EVEN'),
         ALL_ODD: _('ALL ODD'),
         // STRAIGHT: '',
      };
      return rules[rule] ?? '';
   }
}
