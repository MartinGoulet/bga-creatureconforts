class PreEndGame implements StateHandler {
   private resource_manager?: IResourceManager<IconsType>;
   private toolbar: ToolbarContainer = new ToolbarContainer('stored');
   private toolbarButton: ToolbarContainer = new ToolbarContainer('stored-buttons');
   private stored_resources: Record<number, any[]> = {};

   constructor(private game: CreatureConforts) {}

   onEnteringState(args: any): void {
      const { conforts, improvements } = this.game.getCurrentPlayerTable();

      const canAddStoryFood: boolean =
         improvements.getCards().filter((card) => {
            return Number(card.type) === 12;
         }).length > 0 || true;

      const canAddStoryClothing: boolean =
         improvements.getCards().filter((card) => {
            return Number(card.type) === 5;
         }).length > 0;

      const selectableCards = conforts.getCards().filter((card) => {
         const type = this.game.confortManager.getCardType(card);
         return (
            type.storable !== undefined ||
            (type.type === 'food' && canAddStoryFood) ||
            (type.type === 'clothing' && canAddStoryClothing)
         );
      });

      const handleReset = () => {
         this.resource_manager.reset();
      };

      const handleCancel = () => {
         conforts.unselectAll();
      };

      const handleButtonConfirm = () => {
         alert('confirm');
      };

      const handleSelectionChange = (selection: ConfortCard[]) => {
         if (selection.length === 0) {
            this.toolbarButton.removeContainer();
            this.toolbar.removeContainer();
            this.resource_manager?.reset();
            this.resource_manager = null;
            return;
         }
         const cname = this.toolbarButton.addContainer().id;

         this.game.addActionButton('btn_confirm', _('Add resources'), handleButtonConfirm, cname);
         this.game.addActionButton('btn_cancel', _('Cancel'), handleCancel, cname, null, 'gray');
         this.game.addActionButton('btn_reset', _('Reset'), handleReset, cname, null, 'gray');

         const type = this.game.confortManager.getCardType(selection[0]);

         const storable: IconsType[] = ['fruit', 'yarn', 'grain'];
         // const filter_available = type.storable ?? (['story'] as IconsType[]);
         const filter_available = [...storable];
         const available = this.game.getPlayerResources(filter_available);

         if (storable) {
            this.resource_manager = new ResourceManagerPayFor<IconsType>(this.toolbar.addContainer(), {
               from: {
                  available,
                  requirement: storable,
                  count: storable.length,
               },
               to: {},
               times: 99,
            });
         } else {
            this.resource_manager = new ResourceManagerPay<IconsType>(this.toolbar.addContainer(), {
               player_resources: available,
               resource_count: 1,
               requirement: ['story'],
            });
         }
      };

      conforts.setSelectionMode('single');
      conforts.setSelectableCards(selectableCards);
      conforts.onSelectionChange = handleSelectionChange;
   }
   onLeavingState(): void {}
   onUpdateActionButtons(args: any): void {
      const handleConfirm = () => {
         this.game.takeAction('confirmStoreResource', {});
      };

      this.game.addActionButton('btn_ress', _('Confirm stored resources'), handleConfirm);
   }
}
