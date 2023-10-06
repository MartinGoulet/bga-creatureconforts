class PlayerTurnDiceState implements StateHandler {
   private readonly diceHelper: DiceHelper;
   private diceModification: { [diceId: number]: number } = {};

   private original_dice: Dice[] = [];

   constructor(private game: CreatureConforts) {
      this.diceHelper = new DiceHelper(game);
   }

   onEnteringState(args: any): void {
      if (!this.game.isCurrentPlayerActive()) return;

      const { hill, worker_locations, dice_locations } = this.game.tableCenter;

      this.original_dice = hill.getDice().map((die) => Object.assign({}, die));
      this.original_dice.forEach((die) => (this.diceModification[die.id] = 0));

      const handleGladeSlotClick = (slot_id: number) => {
         const canAddDice =
            this.getDiceFromLocation(Number(slot_id)).length == 0 &&
            (hill.getSelection()[0] as Dice).owner_id;

         if (canAddDice) {
            this.addSelectedDieToSlot(slot_id);
         }
      };

      const handleHillClick = (selection: Dice[]) => {
         // Clean selection
         worker_locations.setSelectableLocation([]);
         document.querySelectorAll('#dice-locations .slot-dice').forEach((slot) => {
            slot.classList.remove('selectable');
         });

         if (selection.length == 0) {
            return;
         }

         dice_locations.unselectAll();

         // Add selectable location
         const locations = this.game.tableCenter.getWorkerLocations().filter((location_id) => {
            const count = this.getDiceFromLocation(location_id).length;
            const max = this.diceHelper.getTotalDiceSlot(location_id);
            return count < max || max == -1;
         });
         worker_locations.setSelectableLocation(locations);

         // If family dice
         if (selection[0].owner_id) {
            this.game.tableCenter.glade
               .getCards()
               .map((card) => Number(card.location_arg))
               .forEach((location) => {
                  const dice = this.getDiceFromLocation(location);
                  document
                     .querySelector(`#dice-locations [data-slot-id="${location}"]`)
                     .classList.toggle('selectable', dice.length == 0);
               });
         }
      };

      const handleWorkerLocationClick = (slotId: SlotId) => {
         this.addSelectedDieToSlot(slotId);
      };

      const handleDiceLocationClick = (selection: Dice[]) => {
         if (selection.length == 1) {
            hill.unselectAll();
         }
         this.game.updatePageTitle();
      };

      hill.setSelectionMode('single');
      hill.onSelectionChange = handleHillClick;
      worker_locations.OnLocationClick = handleWorkerLocationClick;
      dice_locations.setSelectionMode('single');
      dice_locations.onSelectionChange = handleDiceLocationClick;

      document.querySelectorAll('#dice-locations .slot-dice').forEach((slot: HTMLElement) => {
         slot.addEventListener('click', (ev: Event) => {
            ev.stopPropagation();
            const slot_id = Number(slot.dataset.slotId);
            handleGladeSlotClick(slot_id);
         });
      });
   }

   onLeavingState(): void {
      const { hill, worker_locations, dice_locations } = this.game.tableCenter;
      hill.setSelectionMode('none');
      hill.onSelectionChange = null;
      worker_locations.OnLocationClick = null;
      dice_locations.onDieClick = null;
      document.querySelectorAll('#dice-locations .lesson-wrapper').forEach((value) => value.remove());
   }

   onUpdateActionButtons(args: any): void {
      const { hill, dice_locations } = this.game.tableCenter;
      const [die, ...others] = this.game.tableCenter.dice_locations.getSelection();

      const handleCancel = () => {
         document.querySelectorAll('#dice-locations .lesson-wrapper').forEach((value) => value.remove());
         this.original_dice.forEach((die) => (this.diceModification[die.id] = 0));
         const copy = this.original_dice.map((die) => Object.assign({}, die));
         hill.addDice(copy);
      };

      const handleConfirm = () => {
         // this.validate();
         const dice: Dice[] = this.game.tableCenter.dice_locations.getDice();
         // TODO Better check dice unused
         if (dice.length == 0) return;

         const args = {
            dice_ids: dice.map((die) => die.id).join(';'),
            location_ids: dice.map((die) => Number(die.location)).join(';'),
            modifiers: dice.map((die) => this.diceModification[die.id]).join(';'),
         };
         console.log(args);
         this.game.takeAction('confirmPlayerDice', args);
      };

      if (die) {
         this.addButtonsLessonLearned(die);
      } else {
         this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
         this.game.addActionButtonGray('btn_cancel', _('Reset'), handleCancel);
      }
   }

   private addButtonsLessonLearned(die: Dice) {
      const htmlDie = this.game.diceManager.getDieElement(die).childNodes[0] as HTMLElement;
      const getDieValue = () => Number(die.face); // Number(htmlDie.dataset.visibleFace);
      const getLessonRemaining = () => {
         const nbr_token = this.game.getPlayerPanel(this.game.getPlayerId()).counters['lesson'].getValue();

         let total = 0;
         Object.keys(this.diceModification).forEach((dieId) => {
            total += Math.abs(this.diceModification[dieId]);
         });

         return nbr_token - total;
      };

      const handleDecrease = () => handleModification(1, -1);
      const handleIncrease = () => handleModification(6, +1);

      const handleModification = (limit: number, value: number) => {
         if (getDieValue() + this.diceModification[die.id] == limit) return;
         if (getLessonRemaining() <= 0) {
            const canMakeOppositeMove =
               (this.diceModification[die.id] > 0 && value < 0) ||
               (this.diceModification[die.id] < 0 && value > 0);
            if (!canMakeOppositeMove) {
               this.game.showMessage(_('Not enough lesson learned token remaining'), 'error');
               return;
            }
         }
         this.diceModification[die.id] += value;
         this.displayLessonLearnedToken(htmlDie, die);

         updateButton();
      };

      const handleConfirmLesson = () => {
         this.game.tableCenter.dice_locations.unselectAll();
         this.game.updatePageTitle();
      };

      const handleRemoveLesson = () => {
         this.diceModification[die.id] = 0;
         this.displayLessonLearnedToken(htmlDie, die);
         updateButton();
      };

      const updateButton = () => {
         const count = this.diceModification[die.id];
         this.game.toggleButtonEnable(
            'btn_minus',
            getDieValue() + count > 1 && (getLessonRemaining() > 0 || count > 0),
         );
         this.game.toggleButtonEnable(
            'btn_plus',
            getDieValue() + count < 6 && (getLessonRemaining() > 0 || count < 0),
         );
      };

      const applyIcon = (text: string, icon: string) =>
         text.replace('${token}', ResourceHelper.getElement(icon));

      const label_minus = applyIcon(_('Use ${token} to decrease die value by 1'), 'lesson-minus');
      const label_plus = applyIcon(_('Use ${token} to increase die value by 1'), 'lesson-plus');
      this.game.addActionButton('btn_minus', label_minus, handleDecrease);
      this.game.addActionButton('btn_plus', label_plus, handleIncrease);
      this.game.addActionButtonGray('btn_confirm_lesson', _('Confirm token'), handleConfirmLesson);
      this.game.addActionButtonRed('btn_remove', _('Remove all tokens from this die'), handleRemoveLesson);

      updateButton();
   }

   private displayLessonLearnedToken(htmlDie: HTMLElement, die: Dice) {
      const lesson_wrapper = htmlDie.parentElement.querySelector('.lesson-wrapper');
      if (lesson_wrapper) {
         lesson_wrapper.remove();
      }

      const icon = this.diceModification[die.id] > 0 ? 'lesson-plus' : 'lesson-minus';
      const icons = arrayRange(1, Math.abs(this.diceModification[die.id]))
         .map(() => ResourceHelper.getElement(icon))
         .join('');
      htmlDie.parentElement.insertAdjacentHTML('beforeend', `<div class="lesson-wrapper">${icons}</div>`);
   }

   private validate() {
      const locations = this.game.tableCenter.getWorkerLocations();
      const error: number[] = [];

      for (const location_id of locations) {
         const dice = this.getDiceFromLocation(location_id);
         if (!this.diceHelper.isRequirementMet(location_id, dice)) {
            error.push(location_id);
         }
      }

      if (error.length > 0) {
         this.game.showMessage(`Requirement not met for location ${error.join(', ')}`, 'error');
      } else {
         this.game.showMessage(`Requirement met`, 'info');
      }
   }

   private getDiceFromLocation(location_id: number): Dice[] {
      return this.game.tableCenter.dice_locations
         .getDice()
         .filter((die: Dice) => die.location == location_id);
   }

   private addSelectedDieToSlot(slotId: SlotId) {
      const { hill, dice_locations } = this.game.tableCenter;
      const die = hill.getSelection()[0];
      if (!die) return;
      const copy = { ...die, location: slotId };
      dice_locations.addDie(copy);
   }
}
