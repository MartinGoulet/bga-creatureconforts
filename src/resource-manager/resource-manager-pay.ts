interface ResourceManagerPaySettings<TResource> {
   player_resources: IResourceCounterSettings<TResource>[];
   resource_count: number;
}

class ResourceManagerPay<TResource> implements IResourceManager<TResource> {
   private resource_player: ResourceCounterLineStock<TResource>;
   private resource_paid: ResourcePlaceholderLineStock<TResource>;

   constructor(root: HTMLElement, settings: ResourceManagerPaySettings<TResource>) {
      const { player_resources, resource_count } = settings;

      root.classList.add('resource-container');
      root.classList.add('resource-manager-pay');

      this.resource_player = new ResourceCounterLineStock<TResource>(root, {
         resources: player_resources,
      });

      root.appendChild(this.createSpacer());

      this.resource_paid = new ResourcePlaceholderLineStock(root, resource_count);

      this.resource_player.onClick = (type: TResource): boolean | undefined => {
         this.resource_paid.add(type);
         if (this.resource_paid.isFull()) {
            this.resource_player.disable();
         }
         return undefined;
      };
   }
   getResourcesFrom(): TResource[] {
      const res = this.resource_paid.get();
      return res;
   }
   getResourcesTo(): TResource[] {
      return [];
   }
   reset() {
      this.resource_player.reset();
      this.resource_paid.reset();
   }

   private createSpacer(): HTMLElement {
      const divSpacer = document.createElement('div');
      divSpacer.classList.add('spacer');
      return divSpacer;
   }
}
