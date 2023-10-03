class ResolveTravelerState implements StateHandler {
   private convert?: ResourceConverter;
   private reward: TravelerReward;
   private is_confirm_enable: boolean;

   constructor(private game: CreatureConforts) {}

   onEnteringState(args: any): void {
      const { worker_locations, dice_locations } = this.game.tableCenter;
      worker_locations.setSelectableLocation([9]);
      worker_locations.setSelectedLocation([9]);

      const die = dice_locations.getDice().find((die: Dice) => die.location == 9);

      const traveler_type = Number(this.game.tableCenter.traveler_deck.getTopCard().type);
      const reward = this.game.gamedatas.travelers.types[traveler_type].reward[die.face];
      this.reward = reward;
      const handleEnabledConfirm = (enable: boolean) => {
         this.is_confirm_enable = enable;
         this.game.toggleButtonEnable('btn_confirm', enable);
      };

      if (reward.from == null || reward.from.length == 0) {
         this.convert = undefined;
         // Resolve automatically
         this.game.takeAction('resolveWorker', { location_id: 9, resources: [], resource2: [] }, null, () => {
            this.game.restoreGameState();
         });
      } else {
         this.convert = new ResourceConverter(this.game, reward.from ?? GOODS, reward.to, reward.times);
         this.convert.OnEnableConfirm = handleEnabledConfirm;
         this.game.toggleButtonEnable('btn_confirm', reward.from?.length == 0);
         this.is_confirm_enable = reward.from?.length == 0;
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
         if (!this.is_confirm_enable) return;

         const resources_give = ResourceHelper.convertToInt(this.convert.getResourcesGive()).join(';');
         const data = { location_id: 9, resources: resources_give };
         if (this.reward.to.length == 1 && this.reward.to[0] === '*') {
            data['resources2'] = ResourceHelper.convertToInt(this.convert.getResourcesGet()).join(';');
         }
         this.game.takeAction('resolveWorker', data);
      };
      this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
      this.game.addActionButtonClientCancel();
   }
}

interface ResolveTravelerState {
   // card_type: TravelerType;
}
