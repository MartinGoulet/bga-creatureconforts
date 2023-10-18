class ImprovementBicycleState implements StateHandler {
   private available: string[];

   constructor(private game: CreatureConforts) {}

   onEnteringState(args: any): void {
      if (!this.game.isCurrentPlayerActive()) return;

      const { worker_locations } = this.game.tableCenter;
      this.available = worker_locations.getCards().map((worker) => worker.location_arg);
      worker_locations.setSelectableLocation(this.available);
      worker_locations.OnLocationClick = (slotId: SlotId) => {
         if (worker_locations.isSelectedLocation(slotId)) {
            this.reset();
         } else {
            worker_locations.setSelectedLocation([slotId]);
            worker_locations.setSelectableLocation([slotId]);
            this.game.enableButton('btn_confirm', 'blue');
            this.game.enableButton('btn_reset', 'gray');
         }
      };
   }

   onLeavingState(): void {
      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectedLocation();
      worker_locations.setSelectableLocation();
      worker_locations.OnLocationClick = undefined;
   }

   onUpdateActionButtons(args: any): void {
      const handleConfirm = () => {
         const selectedSlotId = this.game.tableCenter.worker_locations.getSelectedLocation();
         if (selectedSlotId.length !== 1) return;

         const worker_id = Number(
            this.game.tableCenter.worker_locations
               .getCards()
               .find((worker) => worker.location_arg == selectedSlotId[0]).id,
         );

         this.game.setClientState('resolveBicycleDestination', {
            descriptionmyturn: _('${you} must select a destination for your worker'),
            args: {
               worker_id,
               location: Number(selectedSlotId[0]),
            },
         });
      };

      this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirm);
      this.game.addActionButtonPass(true);
      this.game.addActionButtonDisabled('btn_reset', _('Reset'), () => this.reset());
   }

   reset() {
      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectedLocation();
      worker_locations.setSelectableLocation(this.available);
      this.game.disableButton('btn_confirm');
      this.game.disableButton('btn_reset');
   }
}
