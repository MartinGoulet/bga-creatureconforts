class PlayerTurnDiceState implements StateHandler {
   private readonly diceHelper: DiceHelper;

   constructor(private game: CreatureConforts) {
      this.diceHelper = new DiceHelper(game);
   }

   onEnteringState(args: any): void {
      if (!this.game.isCurrentPlayerActive()) return;

      const { hill, worker_locations, dice_locations } = this.game.tableCenter;

      const handleHillClick = (selection: Dice[]) => {
         if (selection.length == 1) {
            const locations = this.game.tableCenter.getWorkerLocations().filter((location_id) => {
               const count = this.getDiceFromLocation(location_id).length;
               return count < this.diceHelper.getTotalDiceSlot(location_id);
            });

            worker_locations.setSelectableLocation(locations);
         } else {
            worker_locations.setSelectableLocation([]);
         }
      };

      const handleWorkerLocationClick = (slotId: SlotId) => {
         const [die, ...others] = hill.getSelection();
         if (!die) return;
         const copy = { ...die, location: slotId };
         dice_locations.addDie(copy);
      };

      const handleDiceLocationClick = (die: BgaDie) => {
         hill.unselectAll();
         hill.addDie(die);
      };

      hill.setSelectionMode('single');
      hill.onSelectionChange = handleHillClick;
      worker_locations.OnLocationClick = handleWorkerLocationClick;
      dice_locations.onDieClick = handleDiceLocationClick;
   }

   onLeavingState(): void {
      const { hill, worker_locations, dice_locations } = this.game.tableCenter;
      hill.setSelectionMode('none');
      hill.onSelectionChange = null;
      worker_locations.OnLocationClick = null;
      dice_locations.onDieClick = null;
   }

   onUpdateActionButtons(args: any): void {
      const handleCancel = () => {
         const { hill, dice_locations } = this.game.tableCenter;
         hill.addDice(dice_locations.getDice());
      };

      const handleConfirm = () => {
         // this.validate();
         const dice: Dice[] = this.game.tableCenter.dice_locations.getDice();
         const args = {
            dice_ids: dice.map((die) => die.id).join(';'),
            location_ids: dice.map((die) => Number(die.location)).join(';'),
         };
         console.log(args);
         this.game.takeAction('confirmPlayerDice', args);
      };

      this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
      this.game.addActionButtonGray('btn_cancel', _('Cancel'), handleCancel);
   }

   private validate() {
      const locations = this.game.tableCenter.getWorkerLocations();
      const error: number[] = [];

      for (const location_id of locations) {
         const dice = this.getDiceFromLocation(location_id);
         if (!this.diceHelper.isRequirementMet(location_id, dice)) {
            error.push(location_id);
         }
      }

      if (error.length > 0) {
         this.game.showMessage(`Requirement not met for location ${error.join(', ')}`, 'error');
      } else {
         this.game.showMessage(`Requirement met`, 'info');
      }
   }

   private getDiceFromLocation(location_id: number): Dice[] {
      return this.game.tableCenter.dice_locations
         .getDice()
         .filter((die: Dice) => die.location == location_id);
   }
}
