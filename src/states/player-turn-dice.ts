class PlayerTurnDiceState implements StateHandler {
   private readonly diceHelper: DiceHelper;
   private original_dice: Dice[] = [];

   constructor(private game: CreatureConforts) {
      this.diceHelper = new DiceHelper(game);
   }

   onEnteringState(args: any): void {
      if (!this.game.isCurrentPlayerActive()) return;

      const { hill, worker_locations, dice_locations } = this.game.tableCenter;
      this.original_dice = hill.getDice().map((die) => Object.assign({}, die));

      const handleGladeSlotClick = (slot_id: number) => {
         const canAddDice =
            this.game.tableCenter.getDiceFromLocation(Number(slot_id)).length == 0 &&
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
            const count = this.game.tableCenter.getDiceFromLocation(location_id).length;
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
                  const dice = this.game.tableCenter.getDiceFromLocation(location);
                  document
                     .querySelector(`#dice-locations [data-slot-id="${location}"]`)
                     .classList.toggle('selectable', dice.length == 0);
               });
         }
      };

      const handleWorkerLocationClick = (slotId: SlotId) => {
         this.addSelectedDieToSlot(slotId);
      };

      hill.setSelectionMode('single');
      hill.onSelectionChange = handleHillClick;
      worker_locations.OnLocationClick = handleWorkerLocationClick;

      document.querySelectorAll('#dice-locations .slot-dice').forEach((slot: HTMLElement) => {
         slot.addEventListener('click', (ev: Event) => {
            ev.stopPropagation();
            const slot_id = Number(slot.dataset.slotId);
            handleGladeSlotClick(slot_id);
         });
      });
   }

   onLeavingState(): void {
      const { hill, worker_locations } = this.game.tableCenter;
      hill.setSelectionMode('none');
      hill.onSelectionChange = null;
      worker_locations.OnLocationClick = null;
   }

   onUpdateActionButtons(args: any): void {
      const { hill, dice_locations } = this.game.tableCenter;

      const handleCancel = () => {
         const copy = this.original_dice.map((die) => Object.assign({}, die));
         hill.addDice(copy);
      };

      const handleConfirm = () => {
         const dice: Dice[] = dice_locations.getDice();

         const args: PlayerTurnDiceManipulationArgs = {
            dice: [...dice.sort((a, b) => a.id - b.id)],
            original: this.original_dice,
            lessons: Number(this.game.getCurrentPlayerPanel().counters['lesson'].getValue()),
            umbrella: this.game.getCurrentPlayerTable().hasUmbrella(),
         };

         this.game.setClientState('resolvePlayerTurnDiceManipulation', {
            descriptionmyturn: _('${you} can modify dices'),
            args,
         });
      };

      this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
      this.game.addActionButtonGray('btn_cancel', _('Reset'), handleCancel);
   }

   private addSelectedDieToSlot(slotId: SlotId) {
      const { hill, dice_locations } = this.game.tableCenter;
      const die = hill.getSelection()[0];
      if (!die) return;
      const copy = { ...die, location: Number(slotId) };
      dice_locations.addDie(copy);
   }
}
