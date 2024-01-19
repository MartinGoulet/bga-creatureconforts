class ResolveGuestCottageTakeState implements StateHandler {
   private resource_manager?: ResourceManagerPayFor<IconsType>;
   private toolbar: ToolbarContainer = new ToolbarContainer('guest-cottage-take');

   constructor(private game: CreatureComforts) {}

   onEnteringState(args: ResolveGuestCottageTakeArgs): void {
      if (!this.game.isCurrentPlayerActive()) return;
      const available = GOODS.map((p) => {
         return { resource: p, initialValue: 1 } as IResourceCounterSettings<GoodsType>;
      });
      this.resource_manager = new ResourceManagerPayFor(this.toolbar.addContainer(), {
         from: { available, count: 1 },
         to: {},
         times: 1,
      });
   }

   onLeavingState(): void {
      this.toolbar.removeContainer();
      this.resource_manager?.reset();
      this.resource_manager = null;
   }

   onUpdateActionButtons(args: ResolveGuestCottageTakeArgs): void {
      const handleConfirm = () => {
         const rm = this.resource_manager;

         if (rm.hasTradePending() || rm.getResourcesFrom().length === 0) {
            this.game.showMessage(_('You have trade that was incomplete'), 'error');
            return;
         }

         this.game.setClientState('resolveGuestCottageGive', {
            descriptionmyturn: _(`You must select one resource to give`),
            args: {
               location_id: args.location_id,
               take: rm.getResourcesFrom()[0] as GoodsType,
            } as ResolveGuestCottageGiveArgs,
         });
      };

      const handleReset = () => {
         this.resource_manager.reset();
      };

      this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
      this.game.addActionButtonClientCancel();
      this.game.addActionButtonGray('btn_reset', _('Reset'), handleReset);
   }
}

interface ResolveGuestCottageTakeArgs {
   location_id: number;
}
