class PlayerTurnResolveState implements StateHandler {
   constructor(private game: CreatureConforts) {}
   onEnteringState(args: any): void {
      if (!this.game.isCurrentPlayerActive()) return;

      const { worker_locations } = this.game.tableCenter;
      const locations = this.game.tableCenter.getWorkerLocations();

      const handleWorkerLocationClick = (slotId: SlotId) => {
         if (worker_locations.isSelectedLocation(slotId)) {
            worker_locations.setSelectedLocation([]);
            this.game.disableButton('btn_resolve');
         } else {
            worker_locations.setSelectedLocation([slotId]);
            this.game.enableButton('btn_resolve');
         }
      };

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
         } else {
            this.game.takeAction('resolveWorker', { location_id });
         }
      };
      this.game.addActionButtonDisabled('btn_resolve', _('Resolve'), handleResolve);
   }
}
