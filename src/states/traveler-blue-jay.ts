class TravelerBlueJayState implements StateHandler {
   public isMultipleActivePlayer: boolean = true;

   private readonly diceHelper: DiceHelper;
   private original_dice: Dice[] = [];

   constructor(private game: CreatureComforts) {
      this.diceHelper = new DiceHelper(game);
   }

   onEnteringState(args: TravelerBlueJayArgs): void {
      this.original_dice = [...args.dice];

      const { hill, worker_locations, dice_locations } = this.game.tableCenter;

      const handleDiceLocationClick = (die: Dice) => {
         dice_locations.unselectDie(die, true);
         hill.addDie(die);
         hill.unselectAll();
         this.game.disableButton('btn_confirm');
      };

      const handleHillClick = (selection: Dice[]) => {
         // Clean selection
         worker_locations.setSelectableLocation([]);
         document.querySelectorAll('#dice-locations .slot-dice, #glade .slot-dice').forEach((slot) => {
            slot.classList.remove('selectable');
         });

         if (selection.length == 0) {
            return;
         }

         dice_locations.unselectAll();

         // Add selectable location
         let preFilter = arrayRange(1, 4);
         if (hill.getDice().length !== 4) {
            preFilter = preFilter.filter(
               (location_id) => this.game.tableCenter.getDiceFromLocation(location_id).length > 0,
            );
         }

         const locations = preFilter.filter((location_id) => {
            const count = this.game.tableCenter.getDiceFromLocation(location_id).length;
            const max = this.diceHelper.getTotalDiceSlot(location_id);
            return count < max || max == -1;
         });
         worker_locations.setSelectableLocation(locations);
      };

      const handleWorkerLocationClick = (slotId: SlotId) => {
         this.addSelectedDieToSlot(slotId);
         const location_id = Number(slotId);
         const isRequirementMet = this.diceHelper.isRequirementMet(
            location_id,
            this.game.tableCenter.getDiceFromLocation(location_id),
         );
         this.game.toggleButtonEnable('btn_confirm', isRequirementMet, 'blue');
      };

      if (!this.game.isCurrentPlayerActive()) {
         this.displayDiceSelection(args._private.location_id, args._private.dice);
      } else {
         hill.setSelectionMode('single');
         hill.onSelectionChange = handleHillClick;
         worker_locations.OnLocationClick = handleWorkerLocationClick;
         dice_locations.onDieClick = handleDiceLocationClick;
      }
   }

   onLeavingState(): void {
      const { hill, worker_locations, dice_locations } = this.game.tableCenter;
      hill.setSelectionMode('none');
      hill.onSelectionChange = null;
      worker_locations.OnLocationClick = null;
      dice_locations.onDieClick = null;
   }

   onUpdateActionButtons(args: TravelerBlueJayArgs): void {
      const { hill, dice_locations } = this.game.tableCenter;

      const handleReset = () => {
         const copy = this.original_dice.map((die) => Object.assign({}, die));
         dice_locations.unselectAll();
         hill.unselectAll();
         hill.addDice(copy);
      };

      const handleConfirm = () => {
         const location_id = arrayRange(1, 4).find(
            (loc) => this.game.tableCenter.getDiceFromLocation(loc).length > 0,
         );
         if (location_id === undefined) return;

         const dice = this.game.tableCenter.getDiceFromLocation(location_id);

         if (!this.diceHelper.isRequirementMet(location_id, dice)) {
            this.game.showMessage(_('Requirement not met'), 'error');
            return;
         }

         const dice_ids = dice.map((die) => die.id).join(';');
         const data = { location_id, dice_ids };
         this.game.takeAction('confirmBlueJay', data, () => {
            this.displayDiceSelection(
               location_id,
               dice.map((die) => Number(die.id)),
            );
         });
      };

      const handlePass = () => {
         this.game.takeAction('confirmBlueJay', { location_id: -1, dice_ids: '' });
      };

      const handleCancel = () => {
         this.game.takeAction('cancelBlueJay', {}, () => {
            const { hill } = this.game.tableCenter;
            hill.addDice([...args.dice]);
            this.game.restoreServerGameState();
         });
      };

      if (this.game.isCurrentPlayerActive()) {
         this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
         this.game.addActionButtonGray('btn_reset', _('Reset'), handleReset);
         this.game.addActionButtonRed('btn_pass', _('Pass'), handlePass);
      } else {
         this.game.addActionButtonGray('btn_cancel', _('Cancel'), handleCancel);
      }
   }

   private addSelectedDieToSlot(slotId: SlotId) {
      const { hill, dice_locations } = this.game.tableCenter;
      const die = hill.getSelection()[0];
      if (!die) return;
      const copy = { ...die, location: Number(slotId) };
      dice_locations.addDie(copy);
   }

   private displayDiceSelection(location_id: number, dice_ids: number[]) {
      const { hill, worker_locations, dice_locations } = this.game.tableCenter;
      hill.setSelectionMode('none');
      hill.onSelectionChange = null;
      worker_locations.OnLocationClick = null;
      dice_locations.onDieClick = null;

      if (arrayRange(1, 4).includes(location_id)) {
         dice_ids.forEach((dice_id: number) => {
            const die = hill.getDice().find((die) => die.id == dice_id);
            if (die) {
               const copy = { ...die, location: location_id };
               dice_locations.addDie(copy);
            }
         });
      }
   }
}

interface TravelerBlueJayArgs {
   _private: {
      location_id: number;
      dice: number[];
   };
   dice: Dice[];
}
