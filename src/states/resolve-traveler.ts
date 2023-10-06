class ResolveTravelerState implements StateHandler {
   private resource_manager?: ResourceManagerPayFor<IconsType>;
   private toolbar: ToolbarContainer = new ToolbarContainer('traveler');

   private trade: ResourceManagerPayForSettings<IconsType>;

   constructor(private game: CreatureConforts) {}

   onEnteringState(args: any): void {
      const { worker_locations, dice_locations } = this.game.tableCenter;
      worker_locations.setSelectableLocation([9]);
      worker_locations.setSelectedLocation([9]);

      const die = dice_locations.getDice().find((die: Dice) => die.location == 9);

      const traveler_type = Number(this.game.tableCenter.traveler_deck.getTopCard().type);
      const trade = this.game.gamedatas.travelers.types[traveler_type].trade[die.face];
      this.trade = trade;

      if (trade.from.count === 0) {
         this.resource_manager = undefined;
         // Resolve automatically
         this.game.takeAction('resolveWorker', { location_id: 9, resources: [], resource2: [] }, null, () => {
            this.game.restoreGameState();
         });
      } else {
         this.resource_manager = new ResourceManagerPayFor(this.toolbar.addContainer(), {
            ...trade,
            from: {
               ...trade.from,
               available: this.game.getPlayerResources(trade.from.requirement ?? [...GOODS]),
            },
         });
      }
   }

   onLeavingState(): void {
      this.toolbar.removeContainer();
      this.resource_manager?.reset();
      this.resource_manager = null;

      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectedLocation([]);
   }

   onUpdateActionButtons(args: any): void {
      const toArray = (resources: IconsType[]) => {
         return ResourceHelper.convertToInt(resources).join(';');
      };

      const handleConfirm = () => {
         const rm = this.resource_manager;

         if (rm.hasTradePending() || rm.getResourcesFrom().length === 0) {
            this.game.showMessage(_('You have trade that was incomplete'), 'error');
            return;
         }

         const data = {
            location_id: 9,
            resources: toArray(rm.getResourcesFrom()),
            resources2: toArray(rm.getResourcesTo()),
         };
         this.game.takeAction('resolveWorker', data);
      };

      const handleReset = () => {
         this.resource_manager.reset();
      };

      this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
      this.game.addActionButtonClientCancel();
      this.game.addActionButtonGray('btn_reset', _('Reset'), handleReset);
   }
}
