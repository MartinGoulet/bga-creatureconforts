class ResolveGuestCottageGiveState implements StateHandler {
   private resource_manager?: ResourceManagerPayFor<IconsType>;
   private toolbar: ToolbarContainer = new ToolbarContainer('guest-cottage-give');

   constructor(private game: CreatureComforts) {}

   onEnteringState(args: ResolveGuestCottageGiveArgs): void {
      if (!this.game.isCurrentPlayerActive()) return;
      const available = this.game.getPlayerResources([...GOODS]);
      available.find((info) => info.resource === args.take).initialValue += 1;
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

   onUpdateActionButtons(args: ResolveGuestCottageGiveArgs): void {
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
            location_id: args.location_id,
            resources: toArray([args.take]),
            resources2: toArray(rm.getResourcesFrom()),
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

interface ResolveGuestCottageGiveArgs {
   location_id: number;
   take: GoodsType;
}
