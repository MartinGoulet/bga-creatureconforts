class ResolveWheelbarrowState implements StateHandler {
   private resource_manager?: ResourceManagerPayFor<IconsType>;
   private toolbar: ToolbarContainer = new ToolbarContainer('wheelbarrow');

   constructor(private game: CreatureComforts) {}

   onEnteringState({ location_id }: ResolveWheelbarrowArgs): void {
      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectableLocation([location_id]);
      worker_locations.setSelectedLocation([location_id]);

      const getRequirementFrom = (): GoodsType[] => {
         if ([5, 6, 7].includes(location_id)) {
            return ['stone'];
         }
         const valley_info = ValleyHelper.getValleyLocationInfo(location_id);
         return Object.keys(valley_info.resources).filter((res) => GOODS.includes(res as any)) as GoodsType[];
      };

      const requirement = getRequirementFrom();
      const available1 = this.game.getPlayerResources(requirement as IconsType[]);

      const available = GOODS.map((p) => {
         return { resource: p, initialValue: 1 } as IResourceCounterSettings<GoodsType>;
      }).filter((info) => requirement.includes(info.resource));

      this.resource_manager = new ResourceManagerPayFor(this.toolbar.addContainer(), {
         from: { requirement, available, count: 1 },
         to: {},
         times: 1,
      });
   }

   onLeavingState(): void {
      this.toolbar.removeContainer();
      this.resource_manager?.reset();
      this.resource_manager = null;

      const { worker_locations } = this.game.tableCenter;
      worker_locations.setSelectedLocation([]);
   }

   onUpdateActionButtons({ location_id }: ResolveWheelbarrowArgs): void {
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
            location_id,
            resources: toArray(rm.getResourcesFrom()),
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

interface ResolveWheelbarrowArgs {
   location_id: number;
}
