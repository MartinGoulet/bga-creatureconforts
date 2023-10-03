class PlayerTurnResolveState implements StateHandler {
   constructor(private game: CreatureConforts) {}
   onEnteringState(args: any): void {
      if (!this.game.isCurrentPlayerActive()) return;

      const { worker_locations, dice_locations } = this.game.tableCenter;

      const handleWorkerLocationClick = (slotId: SlotId) => {
         if (worker_locations.isSelectedLocation(slotId)) {
            worker_locations.setSelectedLocation([]);
            this.game.disableButton('btn_resolve');
         } else {
            worker_locations.setSelectedLocation([slotId]);
            this.game.enableButton('btn_resolve');
         }
      };

      const dices = dice_locations.getDice().map((die: Dice) => Number(die.location));
      const locations = this.game.tableCenter
         .getWorkerLocations()
         .filter((location) => dices.indexOf(location) >= 0);
      worker_locations.setSelectableLocation(locations);
      worker_locations.OnLocationClick = handleWorkerLocationClick;
   }
   onLeavingState(): void {
      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectableLocation([]);
      worker_locations.setSelectedLocation([]);
      worker_locations.OnLocationClick = null;
   }
   onUpdateActionButtons(args: any): void {
      const handleResolve = () => {
         if (this.game.tableCenter.worker_locations.getSelectedLocation().length == 0) {
            this.game.showMessage(_('You must select a location with one of your worker'), 'error');
            return;
         }

         const location_id: number = Number(this.game.tableCenter.worker_locations.getSelectedLocation()[0]);
         if (location_id == 8) {
            this.game.setClientState('resolveMarket', {
               descriptionmyturn: _('You must resolve the effect of the market'),
            });
         } else if (location_id == 9) {
            this.game.setClientState('resolveTraveler', {
               descriptionmyturn: _('You must resolve the effect of the traveler'),
            });
         } else if (location_id == 10) {
            this.game.setClientState('resolveWorkshop', {
               descriptionmyturn: _(`You must select one card in the Workshop`),
            });
         } else if (location_id == 11) {
            this.game.setClientState('resolveOwnNest', {
               descriptionmyturn: _(`You must select one card in the Owl's Nest`),
            });
         } else {
            this.game.takeAction('resolveWorker', { location_id });
         }
      };

      const handleEnd = () => {
         this.game.takeAction('confirmResolveWorker');
      };

      if (this.game.tableCenter.getWorkerLocations().length > 0) {
         this.game.addActionButtonDisabled('btn_resolve', _('Resolve'), handleResolve);
         this.game.addActionButtonRed('btn_end', _('End'), handleEnd);
      } else {
         this.game.addActionButton('btn_end', _('End'), handleEnd);
      }

      this.game.addActionButtonUndo();
   }
}
