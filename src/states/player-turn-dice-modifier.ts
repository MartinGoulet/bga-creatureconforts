class PlayerTurnDiceManipulationState implements StateHandler {
   private readonly LOCATIONS_UPDATABLE_DICE = [1, 2, 3, 4, 5, 6, 7, 9, 10, 12];

   private diceManipulation: DiceManipulation[];
   private original: Dice[];
   private toolbar: ToolbarContainer = new ToolbarContainer('dice-manipulation');
   private totalUmbrella: number;
   private totalLesson: number;

   constructor(private game: CreatureComforts) {}

   onEnteringState(args: PlayerTurnDiceManipulationArgs): void {
      this.original = args.original;
      this.initDiceManipulation(args.dice);
      this.validateLocations();
      const { dice_locations } = this.game.tableCenter;
      dice_locations.setSelectionMode('single');
      dice_locations.onSelectionChange = (selection: Dice[]) => {
         this.updateCommandButton();
      };
   }

   onLeavingState(): void {
      this.toolbar.removeContainer();
      this.resetDiceManipulation(false);
      const { dice_locations } = this.game.tableCenter;
      dice_locations.setSelectionMode('none');
      dice_locations.onSelectionChange = undefined;
      document.querySelectorAll(`#dice-locations .is-invalid`).forEach((slot) => {
         slot.classList.remove('is-invalid');
      });
   }

   onUpdateActionButtons(args: PlayerTurnDiceManipulationArgs): void {
      this.totalLesson = args.lessons;
      this.totalUmbrella = args.umbrella ? 1 : 0;

      if (TravelerHelper.isActiveLeopardFrog()) {
         this.totalLesson += 2;
      }

      const handleReset = () => {
         this.game.tableCenter.dice_locations.unselectAll();
         this.resetDiceManipulation(true);
         this.updateCommandButton();
      };

      const handleConfirm = () => {
         this.validateLocations();
         const nbrErrors = document.querySelectorAll(`#dice-locations .slot.is-invalid`).length;
         if (nbrErrors > 0) {
            this.game.showMessage(_('You have at least 1 location that requirement was not met'), 'error');
            return;
         }

         const infos = this.diceManipulation;

         const args = {
            dice_ids: infos.map((info) => info.die.id).join(';'),
            location_ids: infos.map((info) => Number(info.die.location)).join(';'),
            lesson: infos.map((info) => Number(info.lesson)).join(';'),
            umbrella: infos.map((info) => Number(info.umbrella)).join(';'),
         };

         this.game.takeAction('confirmPlayerDice', args);
      };

      this.toolbar.addContainer();
      this.addButtonLessonMinus();
      this.addButtonLessonPlus();
      if (this.game.getCurrentPlayerTable().hasUmbrella()) {
         this.addButtonUmbrella(1);
         this.addButtonUmbrella(2);
      }

      this.game.addActionButton('btnConfirm', _('Confirm'), handleConfirm);
      this.game.addActionButtonGray('btnReset', _('Reset tokens'), handleReset);
      this.game.addActionButtonClientCancel();

      this.updateCommandButton();
   }

   restoreGameState() {
      this.game.tableCenter.hill.addDice([...this.original]);
   }

   private applyIcon(text: string, icon: string, nbr: number) {
      return text.replace('${token}', ResourceHelper.getElement(icon)).replace('${nbr}', nbr.toString());
   }

   private addButtonLessonMinus() {
      const handleLessonMinus = () => {
         const info = this.getSelectedDieInfo();
         if (!info) {
            this.game.showMessage(_('You must select a die first'), 'error');
            return;
         }

         const currentDieValue = this.getSelectedDieValue();
         if (currentDieValue - 1 < 1) {
            this.game.showMessage(_('You cannot use this option yet'), 'error');
            return;
         }

         if (this.getLessonLearnedRemaining() == 0 && info.lesson <= 0) {
            this.game.showMessage(_("You don't have any lesson learned remaining"), 'error');
            return;
         }

         info.lesson -= 1;
         this.displayTokens(info);
         this.updateCommandButton();
      };

      const lesson_minus = this.applyIcon(_('Use ${token} to decrease by ${nbr}'), 'lesson-minus', 1);
      this.game.addActionButton('lm1', lesson_minus, handleLessonMinus, this.toolbar.name);
   }

   private addButtonLessonPlus() {
      const handleLessonPlus = () => {
         const info = this.getSelectedDieInfo();
         if (!info) {
            this.game.showMessage(_('You must select a die first'), 'error');
            return;
         }

         const currentDieValue = this.getSelectedDieValue();
         if (currentDieValue + 1 > 6) {
            this.game.showMessage(_('You cannot use this option yet'), 'error');
            return;
         }

         if (this.getLessonLearnedRemaining() == 0 && info.lesson >= 0) {
            this.game.showMessage(_("You don't have any lesson learned remaining"), 'error');
            return;
         }

         info.lesson += 1;
         this.displayTokens(info);
         this.updateCommandButton();
      };

      const lesson_plus = this.applyIcon(_('Use ${token} to increase by ${nbr}'), 'lesson-plus', 1);
      this.game.addActionButton('lp1', lesson_plus, handleLessonPlus, this.toolbar.name);
   }

   private addButtonUmbrella(nbr: number) {
      const handleUmbrella = () => {
         const info = this.getSelectedDieInfo();
         if (!info) {
            this.game.showMessage(_('You must select a die first'), 'error');
            return;
         }

         const currentDieValue = this.getSelectedDieValue();
         if (currentDieValue + nbr > 6) {
            this.game.showMessage(_('You cannot use this option yet'), 'error');
            return;
         }

         if (this.getUmbrellaRemaining() == 0) {
            this.game.showMessage(_('You already used your umbrella this turn'), 'error');
            return;
         }

         info.umbrella = nbr;
         this.displayTokens(info);
         this.updateCommandButton();
      };

      const umbrella_plus = this.applyIcon(_('Use ${token} to increase by ${nbr}'), 'umbrella', nbr);
      this.game.addActionButton(`up${nbr}`, umbrella_plus, handleUmbrella, this.toolbar.name);
   }

   private displayTokens(info: DiceManipulation, validate = true) {
      const htmlDie = this.game.diceManager.getDieElement(info.die).childNodes[0] as HTMLElement;
      const lesson_wrapper = htmlDie.parentElement.querySelector('.tokens-wrapper');
      if (lesson_wrapper) lesson_wrapper.remove();

      const icon = info.lesson > 0 ? 'lesson-plus' : 'lesson-minus';
      const icons: string[] = arrayRange(1, Math.abs(info.lesson)).map(() => ResourceHelper.getElement(icon));
      for (let index = 0; index < info.umbrella; index++) {
         icons.push(ResourceHelper.getElement('umbrella'));
      }

      htmlDie.parentElement.insertAdjacentHTML(
         'beforeend',
         `<div class="tokens-wrapper">${icons.join('')}</div>`,
      );

      if (validate) {
         this.validateLocation(info.location);
      }
   }

   private getLessonLearnedRemaining(): number {
      const nbrLesson = this.diceManipulation.reduce((total, curr) => (total += Math.abs(curr.lesson)), 0);
      return this.totalLesson - nbrLesson;
   }

   private getSelectedDieInfo(): DiceManipulation | undefined {
      const [selectedDie, ...others] = this.game.tableCenter.dice_locations.getSelection();
      const dieId = selectedDie?.id ?? 0;
      return this.diceManipulation.find((info) => info.die.id === dieId);
   }

   private getSelectedDieValue(): number {
      const info = this.getSelectedDieInfo();
      return info.value + info.lesson + info.umbrella;
   }

   private getUmbrellaRemaining(): number {
      const nbrUmbrella = this.diceManipulation.reduce((t, c) => (t += c.umbrella > 0 ? 1 : 0), 0);
      return this.totalUmbrella - nbrUmbrella;
   }

   private initDiceManipulation(dice: Dice[]) {
      this.diceManipulation = dice.map((die: Dice) => {
         const canModify = this.LOCATIONS_UPDATABLE_DICE.includes(die.location);
         return {
            die,
            value: Number(die.face),
            location: Number(die.location),
            lesson: 0,
            umbrella: 0,
            canModify,
         } as DiceManipulation;
      });
      debug(this.diceManipulation);
   }

   private resetDiceManipulation(validate: boolean) {
      this.diceManipulation.forEach((info) => {
         info.lesson = 0;
         info.umbrella = 0;
         this.displayTokens(info, validate);
      });
   }

   private updateCommandButton() {
      const [selectedDice, ...others] = this.game.tableCenter.dice_locations.getSelection();
      if (selectedDice) {
         const info = this.diceManipulation.find((item) => item.die.id === selectedDice.id);
         const lessonRemaining = this.getLessonLearnedRemaining();
         const umbrellaRemaining = this.getUmbrellaRemaining();

         const toggle = (id, enable) => this.game.toggleButtonEnable(id, enable);
         const currDieValue = this.getSelectedDieValue();
         toggle('lm1', currDieValue > 1 && (lessonRemaining > 0 || info.lesson > 0));
         toggle('lp1', currDieValue < 6 && (lessonRemaining > 0 || info.lesson < 0));
         toggle('up1', currDieValue + 1 <= 6 && umbrellaRemaining > 0);
         toggle('up2', currDieValue + 2 <= 6 && umbrellaRemaining > 0);
      } else {
         this.game.disableButton('lm1');
         this.game.disableButton('lp1');
         this.game.disableButton('up1');
         this.game.disableButton('up2');
      }
   }

   private validateLocation(location: number) {
      const dice = this.diceManipulation
         .filter((info) => info.location === location)
         .map((info) => {
            const newValue = Number(info.die.face) + info.lesson + info.umbrella;
            return { ...info.die, face: newValue };
         });
      const diceHelper = new DiceHelper(this.game);

      const isRequirementMet = diceHelper.isRequirementMet(location, dice);
      const wrapper = document.querySelector(`#dice-locations [data-slot-id="${location}"]`);
      wrapper.classList.toggle('is-invalid', !isRequirementMet);
   }

   private validateLocations() {
      const locations = this.diceManipulation
         .filter((info) => info.canModify)
         .map((info) => info.location)
         .filter((value, index, array) => array.indexOf(value) === index); // Unique

      locations.forEach((loc) => {
         this.validateLocation(loc);
      });
   }
}

interface PlayerTurnDiceManipulationArgs {
   original: Dice[];
   dice: Dice[];
   lessons: number;
   umbrella: boolean;
}

interface DiceManipulation {
   die: Dice;
   value: number;
   location: number;
   canModify: boolean;
   lesson: number;
   umbrella: number;
}
