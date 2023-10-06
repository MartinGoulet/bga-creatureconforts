interface ResourcePlaceholderLineStockSettings<TResource> {
   /**
    * Allowed resources, default: all
    */
   resources?: TResource[];
   /**
    * Add restriction for resource groupe
    */
   restriction?: 'same' | 'different' | 'all_same' | 'all_different';
}

class ResourcePlaceholderLineStock<TResource> {
   private readonly placeholders: ResourcePlaceholder<TResource>[] = [];
   private readonly element: HTMLElement;

   constructor(
      private parent: HTMLElement,
      count: number,
      private settings?: ResourcePlaceholderLineStockSettings<TResource>,
   ) {
      this.element = this.createElement();
      parent.appendChild(this.element);

      for (let index = 0; index < count; index++) {
         this.placeholders.push(
            new ResourcePlaceholder(this.element, {
               allowed: settings?.resources ? [settings.resources[index]] : undefined,
            }),
         );
         if (settings?.restriction && index < count - 1) {
            this.addRestrictionIcon();
         }
      }
   }

   private createElement(): HTMLElement {
      const element = document.createElement('div');
      element.classList.add('resource-placeholder-line-stock');
      return element;
   }

   get(): TResource[] {
      return this.placeholders.filter((p) => !p.isEmpty()).map((p) => p.getResource()!);
   }

   add(resource: TResource): boolean {
      const firstEmpty = this.placeholders.find((p) => p.isEmpty() && p.isResourceAllowed(resource));
      if (firstEmpty) {
         firstEmpty.add(resource);
      }
      return firstEmpty !== undefined;
   }

   canAdd(resource: TResource) {
      const firstEmpty = this.placeholders.find((p) => p.isEmpty() && p.isResourceAllowed(resource));
      if (firstEmpty === undefined) return false;
      if (this.settings?.restriction) {
         const current_resources = this.placeholders.filter((p) => !p.isEmpty()).map((p) => p.getResource());
         if (current_resources.length === 0) return true;

         if (this.settings.restriction === 'different') {
            return current_resources.indexOf(resource) < 0;
         }
         if (this.settings.restriction === 'same') {
            return current_resources.indexOf(resource) >= 0;
         }
      }
      return true;
   }

   isFull() {
      return this.placeholders.find((p) => p.isEmpty()) === undefined;
   }

   reset() {
      return this.placeholders.forEach((p) => p.reset());
   }

   private createDifferentIcon(): HTMLElement {
      const icon = document.createElement('div');
      icon.classList.add('restriction-icon', 'different');
      return icon;
   }
   private createSameIcon(): HTMLElement {
      const icon = document.createElement('div');
      icon.classList.add('restriction-icon', 'same');
      return icon;
   }
   private addRestrictionIcon(): void {
      if (this.settings?.restriction === 'different') {
         this.element.appendChild(this.createDifferentIcon());
      } else if (this.settings?.restriction === 'same') {
         this.element.appendChild(this.createSameIcon());
      }
   }
}
