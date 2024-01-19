class PlayerTurnDiceState implements StateHandler {
   private readonly diceHelper: DiceHelper;
   private original_dice: Dice[] = [];

   private handles: Record<string, any> = [];

   constructor(private game: CreatureComforts) {
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

      const handleDiceLocationClick = (die: Dice) => {
         dice_locations.unselectDie(die, true);
         hill.addDie(die);
         hill.unselectAll();
      };

      const handleHillClick = (selection: Dice[]) => {
         // Clean selection
         worker_locations.setSelectableLocation([]);
         document.querySelectorAll('#dice-locations .slot-dice, #glade .slot-dice').forEach((slot) => {
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
               .filter((card) => {
                  return card.type == '7'
                     ? !this.game.improvementManager.isOwner(card, this.game.getPlayerId())
                     : true;
               })
               .map((card) => Number(card.location_arg))
               .filter((location) => this.game.tableCenter.getDiceFromLocation(location).length == 0)
               .forEach((location) => {
                  const idElement = `#glade [data-slot-id="${location}"]`;
                  if (this.handles[idElement]) {
                     document.querySelector(idElement).removeEventListener('click', this.handles[idElement]);
                     delete this.handles[idElement];
                  }
                  const el = document.querySelector(`#glade [data-slot-id="${location}"]`);
                  el.classList.toggle('selectable', true);
                  const handleEvent = (ev: Event) => {
                     ev.stopPropagation();
                     handleGladeSlotClick(Number(location));
                  };
                  el.addEventListener('click', handleEvent);
                  this.handles[idElement] = handleEvent;
               });
         }
      };

      const handleWorkerLocationClick = (slotId: SlotId) => {
         this.addSelectedDieToSlot(slotId);
      };

      const handleDiceSlotClick = (slotId: SlotId, div: HTMLDivElement) => {
         if (Number(slotId) >= 20 && div.classList.contains('selectable')) {
            this.addSelectedDieToSlot(slotId);
         }
      };

      hill.setSelectionMode('single');
      hill.onSelectionChange = handleHillClick;
      worker_locations.OnLocationClick = handleWorkerLocationClick;
      dice_locations.onDieClick = handleDiceLocationClick;
      dice_locations.onSlotClick = handleDiceSlotClick;
   }

   onLeavingState(): void {
      const { hill, worker_locations, dice_locations } = this.game.tableCenter;
      hill.setSelectionMode('none');
      hill.onSelectionChange = null;
      worker_locations.OnLocationClick = null;
      dice_locations.onDieClick = null;
      Object.keys(this.handles).forEach((key) => {
         debugger;
         const el = document.querySelector(key);
         el.removeEventListener('click', this.handles[key]);
         delete this.handles[key];
      });
   }

   onUpdateActionButtons(args: any): void {
      const { hill, dice_locations } = this.game.tableCenter;

      const handleCancel = () => {
         const copy = this.original_dice.map((die) => Object.assign({}, die));
         dice_locations.unselectAll();
         hill.unselectAll();
         hill.addDice(copy);
      };

      const handleConfirm = () => {
         const dice: Dice[] = dice_locations.getDice();

         const args: PlayerTurnDiceManipulationArgs = {
            dice: [...dice.sort((a, b) => a.id - b.id)],
            original: this.original_dice,
            lessons:
               Number(this.game.getCurrentPlayerPanel().counters['lesson'].getValue()) +
               this.game.getCurrentPlayerPanel().countAlmanac(),
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
