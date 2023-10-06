interface ResourceCounterSettings {
   /**
    * Initial value for the counter. Default 0
    */
   initialValue?: number;
   /**
    * Disable the control. Default false
    */
   disabled?: boolean;
}

class ResourceCounter<TResource> {
   private readonly counter: ebg.counter;
   private readonly element: HTMLElement;

   public onClick?: () => boolean | undefined;

   constructor(parent: Element, public icon: TResource, private settings: ResourceCounterSettings) {
      const resource_counter = this.createCounter();
      this.element = this.createWrapper(icon, [resource_counter, this.createIcon(icon)]);
      parent.appendChild(this.element);

      const { initialValue, disabled } = settings;
      this.counter = createCounter(resource_counter, initialValue ?? 0);
      this.disabled(disabled ?? false);
   }

   private createWrapper(icon: TResource, children: HTMLElement[]): HTMLElement {
      const element = document.createElement('div');
      element.classList.add('resource-counter-wrapper');
      element.dataset.type = '' + icon;
      element.onclick = () => this.handleClick();
      children.forEach((child) => element.appendChild(child));
      return element;
   }

   private createCounter(): HTMLElement {
      const element = document.createElement('span');
      element.classList.add('counter');
      return element;
   }

   private createIcon(icon: TResource): HTMLElement {
      const element = document.createElement('div');
      element.classList.add('resource-icon');
      element.dataset.type = '' + icon;
      return element;
   }

   private handleClick() {
      const notifyClick: boolean =
         this.onClick !== undefined &&
         this.counter.getValue() > 0 &&
         this.element.classList.contains('disabled') === false;

      if (notifyClick) {
         const handled = this.onClick?.();
         if (handled !== false) {
            this.counter.incValue(-1);
            if (this.counter.getValue() === 0) {
               this.disabled(true);
            }
         }
      }
   }

   disabled(value?: boolean) {
      this.element.classList.toggle('disabled', value === true);
   }

   getValue() {
      return this.counter.getValue();
   }

   incValue(value: number) {
      this.counter.incValue(value);
      if (this.counter.getValue() === 0) this.disabled(true);
   }

   setValue(value: number) {
      this.counter.setValue(value);
      if (this.counter.getValue() === 0) this.disabled(true);
   }

   reset() {
      const { initialValue, disabled } = this.settings;
      this.counter.setValue(initialValue ?? 0);
      this.disabled(disabled);
   }
}
