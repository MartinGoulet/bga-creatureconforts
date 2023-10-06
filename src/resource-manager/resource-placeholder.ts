interface ResourcePlaceholderSettings<TResource> {
   /**
    * By default, all resources
    */
   allowed?: TResource[];
}

class ResourcePlaceholder<TResource> {
   private element: HTMLDivElement;
   private resource?: TResource;

   constructor(parent: Element, private settings?: ResourcePlaceholderSettings<TResource>) {
      this.element = document.createElement('div');
      this.element.classList.add('placeholder');
      parent.insertAdjacentElement('beforeend', this.element);
   }

   getResource(): TResource | undefined {
      return this.resource;
   }

   destroy(): void {
      this.element.remove();
   }

   reset(): void {
      this.resource = undefined;
      while (this.element.children.length > 0) {
         this.element.removeChild(this.element.childNodes[0]);
      }
   }

   add(type: TResource) {
      this.resource = type;
      this.element.insertAdjacentHTML('beforeend', ResourceHelper.getElement(type));
   }

   isEmpty(): boolean {
      return this.resource === undefined;
   }

   isResourceAllowed(type: TResource) {
      return this.settings?.allowed === undefined || this.settings.allowed.indexOf(type) >= 0;
   }
}
