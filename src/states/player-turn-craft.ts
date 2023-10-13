class PlayerTurnCraftState implements StateHandler {
   private resourceManager?: ResourceManagerPay<IconsType>;
   private toolbar: ToolbarContainer = new ToolbarContainer('craft');

   constructor(private game: CreatureConforts) {}

   onEnteringState(args: any): void {
      if (!this.game.isCurrentPlayerActive()) return;
      const worker_locations = this.game.tableCenter.worker_locations;
      worker_locations.setSelectionMode('none');
      worker_locations.setSelectableLocation([]);
      worker_locations.setSelectedLocation([]);

      const { hand } = this.game.getCurrentPlayerTable();

      const handleSelectionChange = (selection: ConfortCard[]) => {
         if (this.resourceManager) {
            this.toolbar.removeContainer();
            this.resourceManager.reset();
            this.resourceManager = null;
         }

         this.game.toggleButtonEnable('btn_craft', selection.length == 1);
         this.game.disableButton('btn_reset');
         if (selection.length == 0) return;

         const card_type = this.game.confortManager.getCardType(selection[0]);

         if ('*' in card_type.cost) {
            this.game.enableButton('btn_reset', 'gray');
            this.resourceManager = new ResourceManagerPay(this.toolbar.addContainer(), {
               player_resources: this.game.getPlayerResources([...GOODS]),
               resource_count: 2,
            });
         } else if (TravelerHelper.isActiveHairyTailedHole()) {
            this.game.enableButton('btn_reset', 'gray');

            const requirement: IconsType[][] = [];
            const resource_type: IconsType[] = [];
            let hasStoneOrCoin = false;

            for (const icon in card_type.cost) {
               const count: number = card_type.cost[icon];
               for (let index = 0; index < count; index++) {
                  if (['stone', 'coin'].includes(icon)) {
                     requirement.push(['coin', 'stone']);
                     resource_type.push('coin', 'stone');
                     hasStoneOrCoin = true;
                  } else {
                     requirement.push([icon as IconsType]);
                     resource_type.push(icon as IconsType);
                  }
               }
            }

            if (hasStoneOrCoin) {
               this.resourceManager = new ResourceManagerPay(this.toolbar.addContainer(), {
                  player_resources: this.game.getPlayerResources(resource_type),
                  resource_count: requirement.length,
                  requirement,
               });
            }
         }
      };

      const selection = hand.getCards().filter((card) => {
         const card_type = this.game.confortManager.getCardType(card);
         if (!card_type.cost) {
            console.warn('No cost for', card_type);
            return false;
         }

         let cost = { ...card_type.cost };
         if (TravelerHelper.isActivePileatedWoodpecker() && 'wood' in cost) {
            cost['wood'] -= 1;
            if (cost['wood'] <= 0) {
               delete cost['wood'];
            }
         }

         return ResourceRequirement.isRequirementMet(this.game, cost);
      });

      this.game.enableButton('btn_pass', selection.length > 0 ? 'red' : 'blue');

      hand.setSelectionMode('single');
      hand.setSelectableCards(selection);
      hand.onSelectionChange = handleSelectionChange;
   }
   onLeavingState(): void {
      const { hand } = this.game.getCurrentPlayerTable();
      hand.setSelectionMode('none');
      hand.setSelectableCards([]);
      hand.onSelectionChange = null;
   }
   onUpdateActionButtons(args: any): void {
      const { hand } = this.game.getCurrentPlayerTable();
      const handleCraft = () => {
         const [card] = hand.getSelection();
         if (!card) return;
         const card_type = this.game.confortManager.getCardType(card);

         let cost = { ...card_type.cost };
         if (TravelerHelper.isActivePileatedWoodpecker() && 'wood' in cost) {
            cost['wood'] -= 1;
            if (cost['wood'] <= 0) {
               delete cost['wood'];
            }
         }

         if (!ResourceRequirement.isRequirementMet(this.game, cost)) {
            this.game.showMessage('Requirement not met', 'error');
         }

         let resources: number[] = [];

         // if ('*' in card_type.cost) {
         if (this.resourceManager) {
            resources = ResourceHelper.convertToInt(this.resourceManager.getResourcesFrom());
         }

         this.game.takeAction('craftConfort', { card_id: card.id, resources: resources.join(';') });
      };
      const handlePass = () => {
         this.game.takeAction('passCraftConfort');
      };
      const handleReset = () => {
         this.resourceManager?.reset();
      };

      this.game.addActionButtonDisabled('btn_craft', _('Craft confort'), handleCraft);
      this.game.addActionButtonDisabled('btn_pass', _('Pass'), handlePass);
      this.game.addActionButtonDisabled('btn_reset', _('Reset'), handleReset);
      this.game.addActionButtonUndo();
   }
}
