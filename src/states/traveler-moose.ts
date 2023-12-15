class TravelerMooseState implements StateHandler {
   private ressource_manager: IResourceManager<IconsType>;
   private toolbar = new ToolbarContainer('moose');

   constructor(private game: CreatureComforts) {}

   onEnteringState(args: any): void {
      if (!this.game.isCurrentPlayerActive()) return;

      this.ressource_manager = new ResourceManagerPayFor<IconsType>(this.toolbar.addContainer(), {
         from: { available: this.game.getPlayerResources([...GOODS]), count: 1 },
         to: { resources: ['story'] },
         times: 1,
      });
   }

   onLeavingState(): void {
      this.ressource_manager?.reset();
      this.ressource_manager = undefined;
      this.toolbar.removeContainer();
   }

   onUpdateActionButtons(args: any): void {
      const handleConfirm = () => {
         const rm = this.ressource_manager;
         if (rm.hasTradePending() || rm.getResourcesFrom().length === 0) {
            this.game.showMessage(_('You have trade that was incomplete'), 'error');
            return;
         }
         const resource = ResourceHelper.convertToInt(this.ressource_manager.getResourcesFrom())[0];
         this.game.takeAction('confirmMoose', { resource });
      };
      const handleReset = () => {
         this.ressource_manager.reset();
      };
      const handlePass = () => {
         this.game.takeAction('confirmMoose', { resource: -1 });
      };

      this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
      this.game.addActionButtonGray('btn_reset', _('Reset'), handleReset);
      this.game.addActionButtonGray('btn_pass', _('Pass'), handlePass);
   }
}
