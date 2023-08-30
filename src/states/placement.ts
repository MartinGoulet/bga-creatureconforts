class PlacementState implements StateHandler {
   public isMultipleActivePlayer: boolean = true;

   private locations: number[] = [];
   private original_workers: Meeple[] = [];

   constructor(private game: CreatureConforts) {}

   onEnteringState(args: PlacementStateArgs): void {
      this.original_workers = [];
      this.locations = args._private?.locations?.map((loc) => Number(loc)) ?? [];

      if (this.locations.length > 0) {
         this.locations.forEach((slotId) => this.moveWorker(slotId));
      }

      this.showSelection();
      if (!this.game.isCurrentPlayerActive) return;

      this.game.tableCenter.worker_locations.OnLocationClick = (slotId: SlotId) => {
         this.moveWorker(slotId);
      };
   }

   onLeavingState(): void {
      const deck = this.game.tableCenter.worker_locations;
      deck.setSelectableLocation([]);
      deck.setSelectedLocation([]);
      deck.OnLocationClick = null;
   }

   onUpdateActionButtons(args: any): void {
      const handleCancelLocal = () => {
         this.resetState();
      };

      const handleConfirmPlacement = () => {
         if (this.locations.length !== 4) {
            this.game.showMessage('You must place all your workers', 'error');
            return;
         }
         this.game.takeAction('confirmPlacement', { locations: this.locations.join(';') });
      };

      const handleRestartPlacement = () => {
         this.game.takeAction('cancelPlacement', {}, null, () => {
            this.resetState();
         });
      };

      if (!this.game.isSpectator) {
         if (this.game.isCurrentPlayerActive()) {
            this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirmPlacement);
            this.game.addActionButtonGray('btn_cancel', _('Cancel'), handleCancelLocal);
         } else {
            this.game.addActionButtonGray('btn_restart', _('Cancel'), handleRestartPlacement);
         }
      }
   }

   private moveWorker(slotId: SlotId) {
      const worker = this.game.getCurrentPlayerTable().workers.getCards()[0];
      const copy = { ...worker, location: 'board', location_arg: slotId.toString() };

      this.original_workers.push({ ...worker });
      this.game.tableCenter.worker_locations.addCard(copy);

      this.locations.push(Number(slotId));
      this.showSelection();

      this.game.toggleButtonEnable('btn_confirm', this.locations.length == 4);
   }

   private resetState() {
      this.game.getCurrentPlayerTable().workers.addCards(this.original_workers);
      this.locations = [];
      this.original_workers = [];
      this.showSelection();
      this.game.disableButton('btn_confirm');
   }

   private showSelection() {
      const locations = this.game.tableCenter.worker_locations;
      if (this.locations.length < 4) {
         const selectable = arrayRange(1, 12).filter((num) => this.locations.indexOf(num) < 0);
         locations.setSelectableLocation(selectable);
      } else {
         locations.setSelectableLocation([]);
      }
      locations.setSelectedLocation(this.locations);
   }
}

interface PlacementStateArgs {
   _private?: {
      locations: string[];
   };
}
