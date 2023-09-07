class ResolveTravelerState implements StateHandler {
   private convert: TravelerConvert;

   constructor(private game: CreatureConforts) {}

   onEnteringState(args: any): void {
      const { worker_locations, dice_locations } = this.game.tableCenter;
      worker_locations.setSelectableLocation([9]);
      worker_locations.setSelectedLocation([9]);

      const die = dice_locations.getDice().find((die: Dice) => die.location == 9);
      this.convert = new TravelerConvert(this.game);

      const traveler_type = Number(this.game.tableCenter.traveler_deck.getTopCard().type);
      const reward = this.game.gamedatas.travelers.types[traveler_type].reward[die.face];
      // // const reward = this.game.gamedatas.travelers.types[traveler_type].reward[5];
      // this.game.getPlayerPanel(this.game.getPlayerId()).counters['fruit'].setValue(2);
      // const reward = this.game.gamedatas.travelers.types[traveler_type].reward[5];

      this.convert.show(reward, this.game.getPlayerId());
   }

   onLeavingState(): void {
      this.convert.hide();
      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectedLocation([]);
   }

   onUpdateActionButtons(args: any): void {
      const handleConfirm = () => {
         const resources = this.convert.getResources().join(';');
         this.game.takeAction('resolveWorker', { location_id: 9, resources });
      };
      this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
      this.game.addActionButtonClientCancel();
   }
}

interface ResolveTravelerState {
   // card_type: TravelerType;
}
