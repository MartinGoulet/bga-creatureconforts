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
         const location_id = this.game.tableCenter.worker_locations.getSelectedLocation()[0];
         this.game.takeAction('resolveWorker', { location_id });
      };
      this.game.addActionButtonDisabled('btn_resolve', _('Resolve'), handleResolve);
   }
}
