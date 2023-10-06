class ResolveMarketState implements StateHandler {
   private resource_manager: ResourceManagerPayFor<IconsType>;

   private isModeResource: boolean = false;
   private toolbar: ToolbarContainer = new ToolbarContainer('market');

   constructor(private game: CreatureConforts) {}

   onEnteringState(args: any): void {
      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectableLocation([8]);
      worker_locations.setSelectedLocation([8]);

      this.toolbar.addContainer();
   }

   onLeavingState(): void {
      this.toolbar.removeContainer();
      this.resource_manager.reset();
      this.resource_manager = null;

      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectedLocation([]);
      this.isModeResource = false;
   }

   onUpdateActionButtons(args: any): void {
      const handleConfirm = () => {
         const resources = ResourceHelper.convertToInt(this.resource_manager.getResourcesFrom()).join(';');
         const resources2 = ResourceHelper.convertToInt(this.resource_manager.getResourcesTo()).join(';');
         this.game.takeAction('resolveWorker', { location_id: 8, resources, resources2 }, () => {
            this.game.restoreGameState();
         });
      };
      const handleChoice1 = () => {
         this.resource_manager = new ResourceManagerPayFor(this.toolbar.getContainer(), {
            from: {
               available: this.game.getPlayerResources(['coin']),
               count: 1,
               requirement: ['coin'],
            },
            to: {
               count: 1,
               available: [...GOODS],
            },
            times: 1,
         });
         handleChoice();
      };
      const handleChoice2 = () => {
         this.resource_manager = new ResourceManagerPayFor(this.toolbar.getContainer(), {
            from: {
               available: this.game.getPlayerResources([...GOODS]),
               count: 2,
               restriction: 'same',
            },
            to: {
               count: 1,
               resources: [...GOODS],
            },
            times: 1,
         });
         handleChoice();
      };
      const handleChoice3 = () => {
         this.resource_manager = new ResourceManagerPayFor(this.toolbar.getContainer(), {
            from: {
               available: this.game.getPlayerResources([...GOODS]),
               count: 3,
            },
            to: {
               resources: ['coin'],
            },
            times: 1,
         });
         handleChoice();
      };
      const handleChoice = () => {
         this.isModeResource = true;
         this.game.updatePageTitle();
      };
      const handleReset = () => {
         this.resource_manager.reset();
      };

      if (this.isModeResource) {
         this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
         this.game.addActionButtonClientCancel();
         this.game.addActionButtonGray('btn_reset', _('Reset'), handleReset);
      } else {
         this.game.addActionButton('btn_confirm1', _('Convert Coin to any good'), handleChoice1);
         this.game.addActionButton('btn_confirm2', _('Convert 2 identical goods to any good'), handleChoice2);
         this.game.addActionButton('btn_confirm3', _('Convert 3 goods to a Coin'), handleChoice3);
         this.game.addActionButtonClientCancel();
      }
   }
}
