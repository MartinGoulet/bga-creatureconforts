class ImprovementBicycleDestinationState implements StateHandler {
   private available: string[];

   constructor(private game: CreatureConforts) {}

   onEnteringState(args: ImprovementBicycleDestinationArgs): void {
      if (!this.game.isCurrentPlayerActive()) return;

      document
         .querySelector(`#worker-locations [data-slot-id="${args.location_from}"]`)
         .classList.add('remainder');

      const { worker_locations } = this.game.tableCenter;
      const unavailable = worker_locations.getCards().map((worker) => worker.location_arg);

      const min = TravelerHelper.isActivePineMarten() ? 3 : 1;
      this.available = arrayRange(min, 12).filter((loc) => !unavailable.includes(loc.toString()));

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
      document.querySelector('.remainder').classList.remove('remainder');
      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectedLocation();
      worker_locations.setSelectableLocation();
      worker_locations.OnLocationClick = undefined;
   }

   onUpdateActionButtons({ location_from }: ImprovementBicycleDestinationArgs): void {
      const handleConfirm = () => {
         const locations = this.game.tableCenter.worker_locations.getSelectedLocation();
         if (locations.length !== 1) return;

         this.game.takeAction('confirmBicycle', { location_from, location_to: Number(locations[0]) });
      };
      this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirm);
      this.game.addActionButtonDisabled('btn_reset', _('Reset'), () => this.reset());
      this.game.addActionButtonClientCancel();
   }

   reset() {
      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectedLocation();
      worker_locations.setSelectableLocation(this.available);
      this.game.disableButton('btn_confirm');
      this.game.disableButton('btn_reset');
   }
}

interface ImprovementBicycleDestinationArgs {
   location_from: number;
}
