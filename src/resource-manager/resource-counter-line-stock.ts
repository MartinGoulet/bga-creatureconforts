interface ResourceCounterLineStockSettings<TResource> {
   resources: IResourceCounterSettings<TResource>[];
   classList?: string[];
}

interface IResourceCounterSettings<TResource> {
   resource: TResource;
   initialValue: number;
   disabled?: boolean;
}

class ResourceCounterLineStock<TResource> {
   private readonly counters: ResourceCounter<TResource>[] = [];
   private readonly element: HTMLElement;

   public onClick?: (type: TResource) => boolean | undefined;

   constructor(private parent: HTMLElement, private settings: ResourceCounterLineStockSettings<TResource>) {
      this.element = this.createElement();
      parent.appendChild(this.element);

      settings.resources.forEach(({ resource, initialValue, disabled }) => {
         const counter = new ResourceCounter(this.element, resource, {
            initialValue,
            disabled: disabled ?? (initialValue ?? 0) === 0,
         });
         counter.onClick = () => this.onClick!(resource);
         this.counters.push(counter);
      });
   }

   private createElement(): HTMLElement {
      const element = document.createElement('div');
      element.classList.add('resource-counter-line-stock');
      if (this.settings.classList) {
         element.classList.add(...this.settings.classList);
      }
      return element;
   }

   disable() {
      this.counters.forEach((counter) => counter.disabled(true));
   }

   disableResource(type: TResource) {
      this.counters.find((counter) => counter.icon === type)?.disabled(true);
   }

   reset() {
      this.counters.forEach((counter) => counter.reset());
   }
}
