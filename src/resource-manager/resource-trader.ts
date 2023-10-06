interface ResourceTraderSettings<TResource> {
   from: {
      /**
       * Allowed resources, Default: all
       */
      resources?: TResource[];
      count: number;
      restriction?: 'same' | 'different' | 'all_same' | 'all_different';
   };
   to: {
      resources?: TResource[];
      count?: number;
      restriction?: 'same' | 'different' | 'all_same' | 'all_different';
   };
}

class ResourceTrader<TResource> {
   public readonly element: HTMLElement;
   private readonly from: ResourcePlaceholderLineStock<TResource>;
   private readonly to: ResourcePlaceholderLineStock<TResource>;

   constructor(parent: HTMLElement, { from, to }: ResourceTraderSettings<TResource>) {
      this.element = this.createElement();
      parent.appendChild(this.element);

      this.from = new ResourcePlaceholderLineStock(this.element, from.count, {
         resources: from.resources,
         restriction: from.restriction,
      });
      this.element.append(this.createArrow());
      console.log(to);
      this.to = new ResourcePlaceholderLineStock(this.element, to.count ?? to.resources!.length, {
         restriction: to.restriction,
      });
      if (to.resources) {
         to.resources.forEach((r) => this.to.add(r));
      }
   }

   addFrom(resource: TResource) {
      this.from.add(resource);
   }

   addTo(resource: TResource) {
      this.to.add(resource);
   }

   canAddFrom(resource: TResource): boolean {
      return this.from.canAdd(resource);
   }

   canAddTo(resource: TResource): boolean {
      return this.to.canAdd(resource);
   }

   destroy(): void {
      this.element.remove();
   }

   disable(value: boolean) {
      this.element.classList.toggle('disabled', value);
   }

   getFrom(): TResource[] {
      return this.from.get();
   }

   getTo(): TResource[] {
      return this.to.get();
   }

   isFullFrom(): boolean {
      return this.from.isFull();
   }

   isFullTo(): boolean {
      return this.to.isFull();
   }

   isComplete(): boolean {
      return this.isFullFrom() && this.isFullTo();
   }

   private createElement(): HTMLElement {
      const element = document.createElement('div');
      element.classList.add('resource-trader');
      return element;
   }

   private createArrow(): HTMLElement {
      const divSpacer = document.createElement('div');
      divSpacer.classList.add('arrow');
      return divSpacer;
   }
}
