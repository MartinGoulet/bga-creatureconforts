interface ResourceCounterSettings {
   initialValue?: number;
   disabled?: boolean;
}

class ResourceCounter {
   private readonly counter: ebg.counter;

   public onClick?: () => void;

   constructor(
      private id: string,
      parent: Element,
      private icon: string,
      private settings?: ResourceCounterSettings,
   ) {
      const { initialValue, disabled } = settings;

      const html = `<div id="${id}-${icon}" class="wrapper" data-type="${icon}">
         <span id="${id}-${icon}-counter" class="counter">-</span>
         <div class="resource-icon" data-type="${icon}"></div>
      </div>`;

      parent.insertAdjacentHTML('beforeend', html);

      this.counter = new ebg.counter();
      this.counter.create(`${id}-${icon}-counter`);
      this.counter.setValue(initialValue ?? 0);

      document.getElementById(`${id}-${icon}`).addEventListener('click', () => {
         if (
            this.onClick &&
            this.counter.getValue() > 0 &&
            !document.getElementById(`${this.id}-${this.icon}`).classList.contains('disabled')
         ) {
            this.onClick();
            this.counter.incValue(-1);
         }
      });

      if (disabled) this.disabled(true);
   }

   disabled(value?: boolean) {
      document.getElementById(`${this.id}-${this.icon}`).classList.toggle('disabled', value == true);
   }

   getValue() {
      return this.counter.getValue();
   }

   incValue(value: number) {
      this.counter.incValue(value);
      if (this.counter.getValue() == 0) this.disabled(true);
   }

   setValue(value: number) {
      this.counter.setValue(value);
      if (this.counter.getValue() == 0) this.disabled(true);
   }

   reset() {
      const { initialValue, disabled: enabled } = this.settings;
      this.counter.setValue(initialValue ?? 0);
      this.disabled(enabled);
   }
}

interface PlayerResourceCounterSettings {
   /**
    * List of icons to display. By default : ICONS (ICONS or GOODS)
    */
   icons?: string[];
   /**
    * Player targeted for resources, By default : game.getPlayerId();
    */
   player_id?: number;
   /**
    * Intiate the counter to the value. Default: counter from the player resource.
    */
   initialValue?: number;
}

class PlayerResourceCounter {
   private readonly counters: { [type: string]: ResourceCounter } = {};

   public onResourceClick?: (type: string) => void;

   constructor(
      game: CreatureConforts,
      element: HTMLElement,
      id: string,
      settings: PlayerResourceCounterSettings = {},
   ) {
      const player_id = settings.player_id ?? game.getPlayerId();
      const player_counters = game.getPlayerPanel(player_id).counters;

      const handleResourceClick = (type: string, counter: ResourceCounter) => {
         if (this.onResourceClick) this.onResourceClick(type);
      };

      const icons = settings.icons ?? ICONS;
      icons.forEach((icon) => {
         const value = settings.initialValue ?? player_counters[icon].getValue();
         this.counters[icon] = new ResourceCounter(id, element, icon, {
            initialValue: value,
            disabled: value == 0 || icons.indexOf(icon) < 0,
         });
         this.counters[icon].onClick = () => handleResourceClick(icon, this.counters[icon]);
      });
   }

   reset() {
      Object.keys(this.counters).forEach((type) => {
         this.counters[type].reset();
      });
   }

   disabled() {
      Object.keys(this.counters).forEach((type) => {
         this.counters[type].disabled(true);
      });
   }
}

interface ResourceLineStockSettings {}

class ResourceLineStock implements IResourceLineStock {
   private resources: string[] = [];

   constructor(private element: HTMLElement, private settings: ResourceLineStockSettings = {}) {}

   add(resource: string) {
      this.resources.push(resource);
      this.element.insertAdjacentHTML('beforeend', ResourceHelper.getElement(resource));
   }

   getResources(): string[] {
      return [...this.resources];
   }

   isFull(): boolean {
      return false;
   }

   reset() {
      this.resources = [];
      while (this.element.children.length > 0) {
         this.element.removeChild(this.element.childNodes[0]);
      }
   }
}

class ResourcePlaceholder {
   private element: HTMLDivElement;
   private resource?: string = null;

   constructor(parent: Element) {
      this.element = document.createElement('div');
      this.element.classList.add('placeholder');
      parent.insertAdjacentElement('beforeend', this.element);
   }

   getResource(): string | null {
      return this.resource;
   }

   reset(): void {
      this.resource = null;
      while (this.element.children.length > 0) {
         this.element.removeChild(this.element.childNodes[0]);
      }
   }

   add(type: string) {
      this.resource = type;
      this.element.insertAdjacentHTML('beforeend', ResourceHelper.getElement(type));
   }
}

interface ResourcePlaceholderLineStockSettings {
   /**
    * Restriction. Default: none
    */
   restriction?: 'none' | 'same' | 'different';
}

class ResourcePlaceholderLineStock implements IResourceLineStock {
   private placeholders: ResourcePlaceholder[] = [];

   constructor(
      private element: HTMLElement,
      private count: number,
      settings?: ResourcePlaceholderLineStockSettings,
   ) {
      const restriction = settings?.restriction ?? 'none';
      for (let index = 0; index < count; index++) {
         this.placeholders.push(new ResourcePlaceholder(element));
         if (restriction == 'same') {
            element.insertAdjacentHTML('beforeend', ResourceHelper.getIconSame());
         } else if (restriction == 'different') {
            element.insertAdjacentHTML('beforeend', ResourceHelper.getIconDifferent());
         }
      }
   }

   add(resource: string) {
      const count = this.getResources().length;
      this.placeholders[count].add(resource);
   }

   isFull(): boolean {
      return this.placeholders.every((p) => p.getResource() != null);
   }

   getResources(): string[] {
      return this.placeholders.map((p) => p.getResource()).filter((r) => r !== null);
   }

   reset() {
      this.placeholders.forEach((p) => p.reset());
   }
}

interface IResourceLineStock {
   add(resource: string): void;
   getResources(): string[];
   reset(): void;
   isFull(): boolean;
}

class ResourceHelper {
   static getElement(type: string) {
      return `<div class="resource-icon" data-type="${type}"></div>`;
   }
   static getIconSame() {
      return '<div class="resource-icon same"></div>';
   }
   static getIconDifferent() {
      return '<div class="resource-icon different"></div>';
   }
   static convertToInt(icons: string[]): number[] {
      return icons.map((type) => ICONS.indexOf(type) + 1);
   }
}
