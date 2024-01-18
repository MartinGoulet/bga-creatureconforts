class PlayerTurnResolveState implements StateHandler {
   constructor(private game: CreatureComforts) {}

   onEnteringState(args: PlayerTurnResolveArgs): void {
      const { locations, resolve_market } = args;
      if (!this.game.isCurrentPlayerActive()) return;

      if (resolve_market) {
         this.goToMarket(args);
      }

      const { worker_locations, dice_locations } = this.game.tableCenter;

      const handleWorkerLocationClick = (slotId: SlotId) => {
         const isSelected = worker_locations.isSelectedLocation(slotId);
         this.clearSelectedDiceLocations();
         worker_locations.setSelectedLocation(isSelected ? [] : [slotId]);
         this.resolveLocation(Number(slotId), args, args.wheelbarrow);
      };

      const handleGladeSlotClick = (slotId: number, isSelected: boolean) => {
         if (hasSingleDice(slotId) && isSelected) {
            worker_locations.setSelectedLocation([]);
            this.resolveLocation(Number(slotId), args, args.wheelbarrow);
         }
      };

      const hasSingleDice = (slotId: number) => {
         const diceCount = this.game.tableCenter.getDiceFromLocation(slotId).length;
         return diceCount === 1;
      };

      const handleDieClick = (die: Dice) => {
         if (die.location && die.location >= 20) {
            handleGladeSlotClick(Number(die.location), true);
         }
      };

      worker_locations.setSelectableLocation(locations.filter((f) => f < 20));
      worker_locations.OnLocationClick = handleWorkerLocationClick;

      locations
         .filter((loc) => loc >= 20)
         .forEach((loc) => {
            setTimeout(() => {
               const slot = document.querySelector(`#glade [data-slot-id="${loc}"]`);
               slot.classList.toggle('selectable', true);
            }, 15);
         });
      dice_locations.onDieClick = handleDieClick;

      const slotDices = document.querySelectorAll('#dice-locations .slot-dice:not(:empty)');
      slotDices.forEach((slot: HTMLElement) => {
         slot.classList.toggle('selectable', true);
         slot.addEventListener('click', (ev: Event) => {
            ev.stopPropagation();
            slot.classList.toggle('selected');
            const slot_id = Number(slot.dataset.slotId);
            handleGladeSlotClick(slot_id, slot.classList.contains('selected'));
         });
      });
   }

   onLeavingState(): void {
      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectableLocation([]);
      worker_locations.setSelectedLocation([]);
      worker_locations.OnLocationClick = null;
      this.clearSelectedDiceLocations();
      document.querySelectorAll(`#glade .slot-dice`).forEach((div) => div.classList.remove('selectable'));
      document
         .querySelectorAll('#dice-locations .slot-dice.selected')
         .forEach((div) => div.classList.remove('selected'));
   }

   onUpdateActionButtons(args: PlayerTurnResolveArgs): void {
      const { locations } = args;

      const handleEnd = () => {
         this.game.takeAction('confirmResolveWorker');
      };

      if (locations.length > 0) {
         this.game.addActionButtonRed('btn_end', _('End'), handleEnd);
      } else {
         this.game.addActionButton('btn_end', _('End'), handleEnd);
      }

      this.game.addActionButtonUndo();
   }

   private resolveLocation(locationId: number, args: PlayerTurnResolveArgs, wheelbarrow: number) {
      if (locationId == 8) {
         this.goToMarket(args);
      } else if (locationId == 9) {
         this.game.setClientState('resolveTraveler', {
            descriptionmyturn: _('You must resolve the effect of the traveler'),
         });
      } else if (locationId == 10) {
         this.game.setClientState('resolveWorkshop', {
            descriptionmyturn: _(`You must select one card in the Workshop`),
         });
      } else if (locationId == 11) {
         this.game.setClientState('resolveOwnNest', {
            descriptionmyturn: _(`You must select one card in the Owl's Nest`),
         });
      } else if (wheelbarrow === locationId) {
         this.game.setClientState('resolveWheelbarrow', {
            descriptionmyturn: _(`You must select one card in the Owl's Nest`),
            args: {
               location_id: locationId,
            },
         });
      } else {
         this.game.takeAction('resolveWorker', { location_id: locationId });
      }
   }

   clearSelectedDiceLocations() {
      const selectedDiceLocations = document.querySelectorAll(
         '#dice-locations .slot-dice.selectable.selected, #glade .slot-dice.selectable.selected',
      );
      selectedDiceLocations.forEach((slot) => slot.classList.remove('selected'));
   }

   private goToMarket(args: PlayerTurnResolveArgs) {
      this.game.setClientState('resolveMarket', {
         descriptionmyturn: _('You must resolve the effect of the market'),
         args,
      });
   }
}

interface PlayerTurnResolveArgs {
   locations: number[];
   wheelbarrow: number;
   resolve_market: boolean;
   has_scale: boolean;
   use_scale: boolean;
}
