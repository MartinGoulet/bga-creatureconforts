interface DiceModifierSettings {
   die: Dice;
   lesson: {
      available: number;
      used: number;
   };
   umbrella: {
      available: number;
      used: number;
   };
}

class DiceModifier {
   private readonly diceLessonLearned: Record<number, number> = {};
   private readonly diceUmbrella: Record<number, number> = {};

   constructor(
      private game: CreatureConforts,
      private diceManager: DiceManager,
      private settings: DiceModifierSettings,
   ) {}

   show() {
      const { die } = this.settings;

      const htmlDie = this.diceManager.getDieElement(die).childNodes[0] as HTMLElement;
      const dieValue = Number(die.face);

      const handleConfirmLesson = () => {
         this.game.tableCenter.dice_locations.unselectAll();
         this.game.updatePageTitle();
      };

      const handleRemoveLesson = () => {
         this.diceLessonLearned[die.id] = 0;
         this.displayLessonLearnedToken(htmlDie, die);
         updateButton();
      };

      const updateButton = () => {
         const count = this.diceLessonLearned[die.id];
         this.game.toggleButtonEnable(
            'btn_minus',
            dieValue + count > 1 && (getLessonRemaining() > 0 || count > 0),
         );
         this.game.toggleButtonEnable(
            'btn_plus',
            dieValue + count < 6 && (getLessonRemaining() > 0 || count < 0),
         );
      };

      this.addLessonButtons();

      if (this.game.getCurrentPlayerTable().hasUmbrella()) {
         const label_plus_1 = applyIcon(_('Use ${token} to increase by ${nbr}'), 'umbrella', 1);
         const label_plus_2 = applyIcon(_('Use ${token} to increase by ${nbr}'), 'umbrella', 2);
         this.game.addActionButton('btn_umbrella_1', label_plus_1, () => handleModification(6, 1));
         this.game.addActionButton('btn_umbrella_2', label_plus_2, () => handleModification(6, 2));
      }
      this.game.addActionButtonGray('btn_confirm_lesson', _('Confirm'), handleConfirmLesson);
      this.game.addActionButtonRed('btn_remove', _('Remove all tokens'), handleRemoveLesson);

      updateButton();
   }

   private addLessonButtons() {
      const label_minus = this.applyIcon(_('Use ${token} to decrease by ${nbr}'), 'lesson-minus', 1);
      const label_plus = this.applyIcon(_('Use ${token} to increase by ${nbr}'), 'lesson-plus', 1);
      this.game.addActionButton('btn_minus', label_minus, () => handleModification(1, -1));
      this.game.addActionButton('btn_plus', label_plus, () => handleModification(6, +1));
   }

   private applyIcon(text: string, icon: string, nbr: number) {
      const token = ResourceHelper.getElement(icon);
      return text.replace('${token}', token).replace('${nbr}', nbr.toString());
   }

   private displayLessonLearnedToken(htmlDie: HTMLElement) {
      const die = this.settings.die;
      const lesson_wrapper = htmlDie.parentElement.querySelector('.tokens-wrapper');
      if (lesson_wrapper) {
         lesson_wrapper.remove();
      }

      const icon = this.diceLessonLearned[die.id] > 0 ? 'lesson-plus' : 'lesson-minus';
      const icons = arrayRange(1, Math.abs(this.diceLessonLearned[die.id]))
         .map(() => ResourceHelper.getElement(icon))
         .join('');
      htmlDie.parentElement.insertAdjacentHTML('beforeend', `<div class="tokens-wrapper">${icons}</div>`);
   }

   private getDieValue() {
      return Number(this.settings.die.face);
   }

   private getLessonRemaining() {
      const nbr_token = this.game.getPlayerPanel(this.game.getPlayerId()).counters['lesson'].getValue();

      let total = 0;
      Object.keys(this.diceLessonLearned).forEach((dieId) => {
         total += Math.abs(this.diceLessonLearned[dieId]);
      });

      return nbr_token - total;
   }

   private handleModification(limit: number, value: number) {
      const htmlDie = this.game.diceManager.getDieElement(die).childNodes[0] as HTMLElement;
      const die_id = this.settings.die.id;
      if (this.getDieValue() + this.diceLessonLearned[die_id] == limit) return;
      if (this.getLessonRemaining() <= 0) {
         const canMakeOppositeMove =
            (this.diceLessonLearned[die_id] > 0 && value < 0) ||
            (this.diceLessonLearned[die_id] < 0 && value > 0);
         if (!canMakeOppositeMove) {
            this.game.showMessage(_('Not enough lesson learned token remaining'), 'error');
            return;
         }
      }
      this.diceLessonLearned[die_id] += value;
      this.displayLessonLearnedToken(htmlDie);

      this.updateButton();
   }

   private updateButton() {
      const count = this.diceLessonLearned[this.settings.die.id];
      this.game.toggleButtonEnable(
         'btn_minus',
         getDieValue() + count > 1 && (getLessonRemaining() > 0 || count > 0),
      );
      this.game.toggleButtonEnable(
         'btn_plus',
         getDieValue() + count < 6 && (getLessonRemaining() > 0 || count < 0),
      );
   }
}
