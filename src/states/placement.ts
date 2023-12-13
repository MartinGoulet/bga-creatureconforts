class PlacementState implements StateHandler {
   public isMultipleActivePlayer: boolean = true;

   private locations: number[] = [];
   private original_workers: Meeple[] = [];

   private allowed_workers: Meeple[];
   private locations_unavailable: number[];
   private wheelbarrow: number;

   constructor(private game: CreatureConforts, private is_placement_phase: boolean) {}

   onEnteringState(args: PlacementStateArgs): void {
      debug(args);
      this.allowed_workers = args._private.workers;
      this.locations_unavailable = args._private.locations_unavailable;
      this.wheelbarrow = args._private.wheelbarrow;

      this.original_workers = [];
      const locations = args._private?.locations?.map((loc) => Number(loc)) ?? [];

      if (locations.length > 0) {
         locations.forEach((slotId) => this.moveWorker(slotId, args._private.workers));
      }

      this.showSelection();
      if (args._private.wheelbarrow > 0) {
         this.game.tableCenter.addWheelbarrow(args._private.wheelbarrow);
      }
      if (!this.game.isCurrentPlayerActive) return;

      this.game.tableCenter.worker_locations.OnLocationClick = (slotId: SlotId) => {
         const isValleyOrRiver = Number(slotId) >= 1 && Number(slotId) <= 7;
         const askWheelbarrow =
            isValleyOrRiver && this.wheelbarrow === 0 && args._private.wheelbarrow_count > 0;
         if (askWheelbarrow) {
            const handleYes = () => {
               this.wheelbarrow = Number(slotId);
               this.game.tableCenter.addWheelbarrow(Number(slotId));
               this.moveWorker(slotId, args._private.workers);
            };
            const handleNo = () => {
               this.moveWorker(slotId, args._private.workers);
            };
            this.game.confirmationDialog(_('Do you want to add a wheelbarrow'), handleYes, handleNo);
         } else {
            this.moveWorker(slotId, args._private.workers);
         }
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
         if (this.locations.length !== this.allowed_workers.length) {
            this.game.showMessage('You must place all your workers', 'error');
            return;
         }
         this.game.takeAction('confirmPlacement', {
            locations: this.locations.join(';'),
            wheelbarrow: this.wheelbarrow,
         });
      };

      const handleRestartPlacement = () => {
         this.game.takeAction('cancelPlacement', {}, null, () => {
            this.resetState();
         });
      };

      if (!this.game.isSpectator) {
         if (this.game.isCurrentPlayerActive()) {
            this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirmPlacement);
            this.game.addActionButtonGray('btn_cancel', _('Reset'), handleCancelLocal);
         } else {
            this.game.addActionButtonGray('btn_restart', _('Cancel'), handleRestartPlacement);
         }
      }
   }

   private moveWorker(slotId: SlotId, workers: Meeple[]) {
      if (this.locations.includes(Number(slotId))) {
         this.game.showMessage(_('You already have a worker on that location'), 'error');
         return;
      }

      const worker = workers.filter((w) => !this.original_workers.find((x) => x.id === w.id))[0];
      const copy = { ...worker, location: 'board', location_arg: slotId.toString() };

      this.original_workers.push({ ...worker });
      this.game.tableCenter.worker_locations.addCard(copy);

      this.locations.push(Number(slotId));
      this.showSelection();

      this.game.toggleButtonEnable('btn_confirm', this.locations.length == this.allowed_workers.length);
   }

   private resetState() {
      if (this.original_workers.length > 0) {
         const player_id = Number(this.original_workers[0].type_arg);
         this.game.getPlayerTable(player_id).workers.addCards(this.original_workers);
      }
      this.locations = [];
      this.original_workers = [];
      this.wheelbarrow = 0;
      this.game.tableCenter.clearWheelbarrow();
      this.showSelection();
      this.game.disableButton('btn_confirm');
   }

   private showSelection() {
      const locations = this.game.tableCenter.worker_locations;
      if (this.locations.length < this.allowed_workers.length) {
         if (TravelerHelper.isActivePineMarten()) {
            locations.setSelectableLocation(arrayRange(3, 12));
         } else {
            const selectable = arrayRange(1, 12).filter(
               (num) => this.locations.indexOf(num) < 0 && this.locations_unavailable.indexOf(num) < 0,
            );
            locations.setSelectableLocation(selectable);
         }
      } else {
         locations.setSelectableLocation([]);
      }
      locations.setSelectedLocation(this.locations);
   }
}

interface PlacementStateArgs {
   _private?: {
      locations: string[];
      locations_unavailable: number[];
      workers: Meeple[];
      wheelbarrow: number;
      wheelbarrow_count: number;
   };
}
