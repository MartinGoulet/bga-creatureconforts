class PlayerTurnResolveState implements StateHandler {
   private glade_selection?: number = undefined;

   constructor(private game: CreatureConforts) {}

   onEnteringState({ locations }: PlayerTurnResolveArgs): void {
      if (!this.game.isCurrentPlayerActive()) return;

      const { worker_locations, dice_locations } = this.game.tableCenter;

      const handleWorkerLocationClick = (slotId: SlotId) => {
         const isSelected = worker_locations.isSelectedLocation(slotId);
         this.clearSelectedDiceLocations();
         worker_locations.setSelectedLocation(isSelected ? [] : [slotId]);
         this.game.toggleButtonEnable('btn_resolve', !isSelected);
      };

      const handleGladeSlotClick = (slotId: number, isSelected: boolean) => {
         if (hasSingleDice(slotId)) {
            this.glade_selection = isSelected ? slotId : undefined;
            this.game.toggleButtonEnable('btn_resolve', isSelected);
            worker_locations.setSelectedLocation([]);
         }
      };

      const hasSingleDice = (slotId: number) => {
         const diceCount = this.game.tableCenter.getDiceFromLocation(slotId).length;
         return diceCount === 1;
      };

      worker_locations.setSelectableLocation(locations.filter((f) => f < 20));
      worker_locations.OnLocationClick = handleWorkerLocationClick;

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
      this.glade_selection = undefined;
      document
         .querySelectorAll('#dice-locations .slot-dice.selectable')
         .forEach((div) => div.classList.remove('selectable'));
   }

   onUpdateActionButtons({ locations }: PlayerTurnResolveArgs): void {
      const handleResolve = () => {
         if (this.glade_selection) {
            this.game.takeAction('resolveWorker', { location_id: this.glade_selection });
            return;
         }

         const selectedLocations = this.game.tableCenter.worker_locations.getSelectedLocation();

         if (selectedLocations.length === 0) {
            this.game.showMessage(_('You must select a location with one of your workers'), 'error');
            return;
         }

         const locationId: number = Number(selectedLocations[0]);

         if (locationId == 8) {
            this.game.setClientState('resolveMarket', {
               descriptionmyturn: _('You must resolve the effect of the market'),
            });
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
         } else {
            this.game.takeAction('resolveWorker', { location_id: locationId });
         }
      };

      const handleEnd = () => {
         this.game.takeAction('confirmResolveWorker');
      };

      if (locations.length > 0) {
         this.game.addActionButtonDisabled('btn_resolve', _('Resolve'), handleResolve);
         this.game.addActionButtonRed('btn_end', _('End'), handleEnd);
      } else {
         this.game.addActionButton('btn_end', _('End'), handleEnd);
      }

      this.game.addActionButtonUndo();
   }

   clearSelectedDiceLocations() {
      const selectedDiceLocations = document.querySelectorAll(
         '#dice-locations .slot-dice.selectable.selected',
      );
      selectedDiceLocations.forEach((slot) => slot.classList.remove('selected'));
   }
}

interface PlayerTurnResolveArgs {
   locations: number[];
}
