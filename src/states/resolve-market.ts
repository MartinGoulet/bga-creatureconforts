class ResolveMarketState implements StateHandler {
   private resource_manager: ResourceManagerPayFor<IconsType>;
   private option: number;
   private isModeResource: boolean = false;
   private toolbar: ToolbarContainer = new ToolbarContainer('market');

   constructor(private game: CreatureComforts) {}

   onEnteringState(args: ResolveMarkerArgs): void {
      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectableLocation([8]);
      worker_locations.setSelectedLocation([8]);

      this.toolbar.addContainer();
   }

   onLeavingState(): void {
      this.toolbar.removeContainer();
      this.resource_manager?.reset();
      this.resource_manager = null;
      this.option = 0;

      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectedLocation([]);
      this.isModeResource = false;
   }

   onUpdateActionButtons({ resolve_market, has_scale, use_scale }: ResolveMarkerArgs): void {
      const handleConfirm = () => {
         const rm = this.resource_manager;
         if (rm.hasTradePending() || rm.getResourcesFrom().length === 0) {
            this.game.showMessage(_('You have trade that was incomplete'), 'error');
            return;
         }

         const resources = ResourceHelper.convertToInt(rm.getResourcesFrom()).join(';');
         const resources2 = ResourceHelper.convertToInt(rm.getResourcesTo()).join(';');
         this.game.takeAction(
            'resolveWorker',
            { location_id: 8, resources, resources2, option: this.option },
            () => {
               this.game.restoreGameState();
            },
         );
      };
      const handleChoice1 = () => {
         this.resource_manager = new ResourceManagerPayFor(this.toolbar.getContainer(), {
            from: {
               available: this.game.getPlayerResources(['coin']),
               count: 1,
            },
            to: {
               count: 1,
               available: [...GOODS],
            },
            times: 99,
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
               available: [...GOODS],
            },
            times: 99,
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
            times: 99,
         });
         handleChoice();
      };
      const handleScale = () => {
         if (use_scale) {
            this.game.showMessage(_('You already use your Scale this turn'), 'error');
            return;
         }
         this.resource_manager = new ResourceManagerPayFor(this.toolbar.getContainer(), {
            from: {
               available: this.game.getPlayerResources([...GOODS]),
               count: 1,
            },
            to: {
               count: 1,
               available: [...GOODS],
            },
            times: 1,
         });
         this.option = 1;
         handleChoice();
      };

      const handleChoice = () => {
         this.isModeResource = true;
         this.game.updatePageTitle();
      };
      const handleReset = () => {
         this.resource_manager.reset();
      };
      const handleEndMarket = () => {
         this.game.takeAction(
            'resolveWorker',
            { location_id: 8, resources: '', resources2: '', option: 2 },
            () => {
               this.game.restoreGameState();
            },
         );
      };

      if (this.isModeResource) {
         this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
         this.game.addActionButtonClientCancel();
         this.game.addActionButtonGray('btn_reset', _('Reset'), handleReset);
      } else {
         this.game.addActionButton('btn_confirm1', _('Convert Coin to any good'), handleChoice1);
         this.game.addActionButton('btn_confirm2', _('Convert 2 identical goods to any good'), handleChoice2);
         this.game.addActionButton('btn_confirm3', _('Convert 3 goods to a Coin'), handleChoice3);
         if (has_scale) {
            this.game.addActionButton('btn_scale', _('Scale : Convert a good for a good'), handleScale);
            this.game.toggleButtonEnable('btn_scale', !use_scale);
         }
         if (resolve_market) {
            this.game.addActionButtonRed('btn_endMarket', _('End market'), handleEndMarket);
         } else {
            this.game.addActionButtonClientCancel();
         }
      }
   }
}

interface ResolveMarkerArgs {
   resolve_market: boolean;
   has_scale: boolean;
   use_scale: boolean;
}
