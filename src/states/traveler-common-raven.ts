class TravelerCommonRavenState implements StateHandler {
   constructor(private game: CreatureComforts) {}

   onEnteringState({ locations_unavailable: location_ids }: TravelerCommonRavenArgs): void {
      if (!this.game.isCurrentPlayerActive()) return;
      debugger;
      const { worker_locations } = this.game.tableCenter;

      worker_locations.OnLocationClick = (slotId: SlotId) => {
         const selection = worker_locations.getSelectedLocation();
         if (selection.includes(slotId)) {
            worker_locations.setSelectedLocation([]);
            worker_locations.setSelectableLocation(arrayRange(1, 12));
            this.game.disableButton('btn_confirm');
         } else {
            worker_locations.setSelectableLocation([slotId]);
            worker_locations.setSelectedLocation([slotId]);
            this.game.enableButton('btn_confirm');
         }
      };

      worker_locations.setSelectableLocation(arrayRange(1, 12).filter((l) => !location_ids.includes(l)));
   }

   onLeavingState(): void {
      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectableLocation();
      worker_locations.setSelectedLocation();
      worker_locations.OnLocationClick = undefined;
   }

   onUpdateActionButtons(args: any): void {
      const handleConfirm = () => {
         const { worker_locations } = this.game.tableCenter;
         if (worker_locations.getSelectedLocation().length == 0) return;

         this.game.takeAction('confirmCommonRaven', {
            location_id: worker_locations.getSelectedLocation()[0],
         });
      };

      this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirm);
   }
}

interface TravelerCommonRavenArgs {
   locations_unavailable: number[];
}
