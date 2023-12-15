class ResolveTravelerState implements StateHandler {
   private resource_manager?: ResourceManagerPayFor<IconsType>;
   private toolbar: ToolbarContainer = new ToolbarContainer('traveler');

   constructor(private game: CreatureComforts) {}

   onEnteringState(args: any): void {
      const { worker_locations, dice_locations } = this.game.tableCenter;
      worker_locations.setSelectableLocation([9]);
      worker_locations.setSelectedLocation([9]);

      const die = dice_locations.getDice().find((die: Dice) => die.location == 9);

      const traveler_type = Number(this.game.tableCenter.traveler_deck.getTopCard().type);
      const trade: ResourceManagerPayForSettings<IconsType> =
         this.game.gamedatas.travelers.types[traveler_type].trade[die.face];

      const getRequirementFrom = (): IconsType[] | IconsType[][] => {
         if (TravelerHelper.isActiveHairyTailedHole()) {
            return trade.from.requirement.map((icon) => [icon, 'coin']);
         } else {
            return trade.from.requirement;
         }
      };

      if (trade.from.count === 0) {
         this.resource_manager = undefined;
         // Resolve automatically
         this.game.takeAction('resolveWorker', { location_id: 9, resources: [], resource2: [] }, null, () => {
            this.game.restoreGameState();
         });
      } else {
         const requirement = getRequirementFrom();
         const filter_available =
            TravelerHelper.isActiveAmericanBeaver() || requirement === undefined
               ? [...GOODS]
               : (requirement as IconsType[]);
         const available = this.game.getPlayerResources(filter_available);

         this.resource_manager = new ResourceManagerPayFor(this.toolbar.addContainer(), {
            ...trade,
            from: {
               ...trade.from,
               available,
               requirement,
            },
            to: {
               ...trade.to,
               available: trade.to.resources !== undefined ? undefined : [...GOODS],
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

         const cardDiscardCount = rm.getResourcesFrom().filter((icon) => icon === 'card').length;

         if (cardDiscardCount > 0) {
            this.game.setClientState('resolveTravelerDiscard', {
               descriptionmyturn: _('${you} must discard ${nbr} card(s) from your hand').replace(
                  '${nbr}',
                  cardDiscardCount.toString(),
               ),
               args: {
                  data,
                  action: 'resolveWorker',
                  count: cardDiscardCount,
               },
            });
         } else {
            this.game.takeAction('resolveWorker', data);
         }
      };

      const handleReset = () => {
         this.resource_manager.reset();
      };

      this.game.addActionButton('btn_confirm', _('Confirm'), handleConfirm);
      this.game.addActionButtonClientCancel();
      this.game.addActionButtonGray('btn_reset', _('Reset'), handleReset);
   }
}
