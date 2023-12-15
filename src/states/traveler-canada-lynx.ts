class TravelerCanadaLynxState implements StateHandler {
   private resource_manager: IResourceManager<GoodsType>;
   private toolbar: ToolbarContainer = new ToolbarContainer('canada-lynx');

   constructor(private game: CreatureComforts) {}

   onEnteringState(args: any): void {
      if (!this.game.isCurrentPlayerActive()) return;

      this.resource_manager = new ResourceManagerPayFor<GoodsType>(this.toolbar.addContainer(), {
         from: {
            available: GOODS.map((p) => {
               return { resource: p, initialValue: 1 } as IResourceCounterSettings<GoodsType>;
            }),
            count: 2,
            restriction: 'different',
         },
         to: {},
         times: 1,
      });
   }

   onLeavingState(): void {
      this.toolbar.removeContainer();
   }

   onUpdateActionButtons(args: any): void {
      const toArray = (resources: IconsType[]) => {
         return ResourceHelper.convertToInt(resources).join(';');
      };

      const handleConfirm = () => {
         const rm = this.resource_manager;

         if (rm.hasTradePending() || rm.getResourcesFrom().length === 0) {
            this.game.showMessage(_('You must select 2 differents goods'), 'error');
            return;
         }

         this.game.takeAction('confirmCanadaLynx', { resources: toArray(rm.getResourcesFrom()) });
      };

      const handleReset = () => {
         this.resource_manager.reset();
      };

      this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
      this.game.addActionButtonGray('btn_reset', _('Reset'), handleReset);
   }
}
