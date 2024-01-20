class ImprovementBicycleState implements StateHandler {
   constructor(private game: CreatureComforts) {}

   onEnteringState({ location_ids }: ImprovementBicycleArgs): void {
      if (!this.game.isCurrentPlayerActive()) return;

      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectableLocation(location_ids);
      worker_locations.OnLocationClick = (slotId: SlotId) => {
         if (worker_locations.isSelectedLocation(slotId)) {
            this.reset(location_ids);
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

   onUpdateActionButtons({ location_ids }: ImprovementBicycleArgs): void {
      const handleConfirm = () => {
         const selectedSlotId = this.game.tableCenter.worker_locations.getSelectedLocation();
         if (selectedSlotId.length !== 1) return;

         const min = TravelerHelper.isActivePineMarten() ? 3 : 1;

         this.game.setClientState('resolveBicycleDestination', {
            descriptionmyturn: _('${you} must select a destination for your worker'),
            args: {
               location_from: Number(selectedSlotId[0]),
               locations: arrayRange(min, 12).filter((loc) => !location_ids.includes(loc)),
            },
         });
      };

      this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirm);
      this.game.addActionButtonPass(true);
      this.game.addActionButtonDisabled('btn_reset', _('Reset'), () => this.reset(location_ids));
   }

   reset(location_ids: number[]) {
      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectedLocation();
      worker_locations.setSelectableLocation(location_ids);
      this.game.disableButton('btn_confirm');
      this.game.disableButton('btn_reset');
   }
}

interface ImprovementBicycleArgs {
   location_ids: number[];
}
