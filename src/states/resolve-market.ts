class ResolveMarketState implements StateHandler {
   private convert: ResourceConverter;

   private isModeResource: boolean = false;

   constructor(private game: CreatureConforts) {}

   onEnteringState(args: any): void {
      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectableLocation([8]);
      worker_locations.setSelectedLocation([8]);
   }

   onLeavingState(): void {
      this.convert.hide();
      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectedLocation([]);
      this.isModeResource = false;
   }

   onUpdateActionButtons(args: any): void {
      const handleConfirm = () => {
         const resources = ResourceHelper.convertToInt(this.convert.getResourcesGive()).join(';');
         this.game.takeAction('resolveWorker', { location_id: 8, resources });
      };
      const handleChoice1 = () => {
         this.convert = new ResourceConverter(this.game, ['coin'], ['*'], 1, {
            from: { allowed_resources: ['coin'], max: 1 },
         });
         handleChoice();
      };
      const handleChoice2 = () => {
         this.convert = new ResourceConverter(this.game, ['*', '*'], ['*'], 1, {
            from: { restriction: 'same', allowed_resources: GOODS },
         });
         handleChoice();
      };
      const handleChoice3 = () => {
         this.convert = new ResourceConverter(this.game, ['*', '*', '*'], ['coin'], 1, {
            from: { allowed_resources: GOODS },
         });
         handleChoice();
      };
      const handleChoice = () => {
         this.convert.show();
         this.isModeResource = true;
         this.game.updatePageTitle();
      };

      if (this.isModeResource) {
         this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
         this.game.addActionButtonClientCancel();
      } else {
         this.game.addActionButton('btn_confirm1', _('Convert Coin to any good'), handleChoice1);
         this.game.addActionButton('btn_confirm2', _('Convert 2 identical goods to any good'), handleChoice2);
         this.game.addActionButton('btn_confirm3', _('Convert 3 goods to a Coin'), handleChoice3);
         this.game.addActionButtonClientCancel();
      }
   }
}

interface ResolveTravelerState {
   // card_type: TravelerType;
}
