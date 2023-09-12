class ResolveTravelerState implements StateHandler {
   private convert?: ResourceConverter;

   constructor(private game: CreatureConforts) {}

   onEnteringState(args: any): void {
      const { worker_locations, dice_locations } = this.game.tableCenter;
      worker_locations.setSelectableLocation([9]);
      worker_locations.setSelectedLocation([9]);

      const die = dice_locations.getDice().find((die: Dice) => die.location == 9);

      const traveler_type = Number(this.game.tableCenter.traveler_deck.getTopCard().type);
      const reward = this.game.gamedatas.travelers.types[traveler_type].reward[die.face];

      if (reward.from == null || reward.from.length == 0) {
         this.convert = undefined;
         // Resolve automatically
         this.game.takeAction('resolveWorker', { location_id: 9, resources: [], resource2: [] }, null, () => {
            this.game.restoreGameState();
         });
      } else {
         this.convert = new ResourceConverter(this.game, reward.from ?? GOODS, reward.to, reward.times);
         this.convert.show();
      }
   }

   onLeavingState(): void {
      this.convert?.hide();
      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectedLocation([]);
   }

   onUpdateActionButtons(args: any): void {
      const handleConfirm = () => {
         const resources_give = ResourceHelper.convertToInt(this.convert.getResourcesGive()).join(';');
         this.game.takeAction('resolveWorker', { location_id: 9, resources: resources_give });
      };
      this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
      this.game.addActionButtonClientCancel();
   }
}

interface ResolveTravelerState {
   // card_type: TravelerType;
}
