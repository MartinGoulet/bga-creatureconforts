// interface ResourceCounterSettings {
//    initialValue?: number;
//    disabled?: boolean;
// }

// class ResourceCounter {
//    private readonly counter: ebg.counter;

//    public onClick?: () => void;

//    constructor(
//       private id: string,
//       parent: Element,
//       private icon: string,
//       private settings?: ResourceCounterSettings,
//    ) {
//       const { initialValue, disabled } = settings;

//       const html = `<div id="${id}-${icon}" class="wrapper" data-type="${icon}">
//          <span id="${id}-${icon}-counter" class="counter">-</span>
//          <div class="resource-icon" data-type="${icon}"></div>
//       </div>`;

//       parent.insertAdjacentHTML('beforeend', html);

//       this.counter = new ebg.counter();
//       this.counter.create(`${id}-${icon}-counter`);
//       this.counter.setValue(initialValue ?? 0);

//       document.getElementById(`${id}-${icon}`).addEventListener('click', () => {
//          if (
//             this.onClick &&
//             this.counter.getValue() > 0 &&
//             !document.getElementById(`${this.id}-${this.icon}`).classList.contains('disabled')
//          ) {
//             this.onClick();
//             this.counter.incValue(-1);
//             if (this.counter.getValue() == 0) {
//                this.disabled(true);
//             }
//          }
//       });

//       if (disabled) this.disabled(true);
//    }

//    disabled(value?: boolean) {
//       document.getElementById(`${this.id}-${this.icon}`).classList.toggle('disabled', value == true);
//    }

//    getValue() {
//       return this.counter.getValue();
//    }

//    incValue(value: number) {
//       this.counter.incValue(value);
//       if (this.counter.getValue() == 0) this.disabled(true);
//    }

//    setValue(value: number) {
//       this.counter.setValue(value);
//       if (this.counter.getValue() == 0) this.disabled(true);
//    }

//    reset() {
//       const { initialValue, disabled: enabled } = this.settings;
//       this.counter.setValue(initialValue ?? 0);
//       this.disabled(enabled);
//    }
// }

// interface PlayerResourceCounterSettings {
//    /**
//     * List of icons to display. By default : ICONS (ICONS or GOODS)
//     */
//    icons?: string[];
//    /**
//     * Player targeted for resources, By default : game.getPlayerId();
//     */
//    player_id?: number;
//    /**
//     * Intiate the counter to the value. Default: counter from the player resource.
//     */
//    initialValue?: number;
// }

// class PlayerResourceCounter {
//    private readonly counters: { [type: string]: ResourceCounter } = {};

//    public onResourceClick?: (type: string) => void;

//    constructor(
//       game: CreatureConforts,
//       element: HTMLElement,
//       id: string,
//       settings: PlayerResourceCounterSettings = {},
//    ) {
//       const player_id = settings.player_id ?? game.getPlayerId();
//       const player_counters = game.getPlayerPanel(player_id).counters;

//       const handleResourceClick = (type: string, counter: ResourceCounter) => {
//          if (this.onResourceClick) this.onResourceClick(type);
//       };

//       const icons = settings.icons ?? ICONS;
//       icons.forEach((icon) => {
//          const value = settings.initialValue ?? player_counters[icon].getValue();
//          this.counters[icon] = new ResourceCounter(id, element, icon, {
//             initialValue: value,
//             disabled: value == 0 || icons.indexOf(icon) < 0,
//          });
//          this.counters[icon].onClick = () => handleResourceClick(icon, this.counters[icon]);
//       });
//    }

//    reset() {
//       Object.keys(this.counters).forEach((type) => {
//          this.counters[type].reset();
//       });
//    }

//    disabled() {
//       Object.keys(this.counters).forEach((type) => {
//          this.counters[type].disabled(true);
//       });
//    }
// }

// interface ResourceLineStockSettings {}

// class ResourceLineStock implements IResourceLineStock {
//    private resources: string[] = [];

//    constructor(private element: HTMLElement, private settings: ResourceLineStockSettings = {}) {}

//    add(resource: string) {
//       this.resources.push(resource);
//       this.element.insertAdjacentHTML('beforeend', ResourceHelper.getElement(resource));
//    }

//    getResources(): string[] {
//       return [...this.resources];
//    }

//    isFull(): boolean {
//       return false;
//    }

//    reset() {
//       this.resources = [];
//       while (this.element.children.length > 0) {
//          this.element.removeChild(this.element.childNodes[0]);
//       }
//    }
// }

// class ResourcePlaceholder {
//    private element: HTMLDivElement;
//    private resource?: string = null;

//    constructor(parent: Element) {
//       this.element = document.createElement('div');
//       this.element.classList.add('placeholder');
//       parent.insertAdjacentElement('beforeend', this.element);
//    }

//    getResource(): string | null {
//       return this.resource;
//    }

//    destroy(): void {
//       this.element.remove();
//    }

//    reset(): void {
//       this.resource = null;
//       while (this.element.children.length > 0) {
//          this.element.removeChild(this.element.childNodes[0]);
//       }
//    }

//    add(type: string) {
//       this.resource = type;
//       this.element.insertAdjacentHTML('beforeend', ResourceHelper.getElement(type));
//    }
// }

// interface ResourcePlaceholderLineStockSettings {
//    /**
//     * Restriction. Default: none
//     */
//    restriction?: 'none' | 'same' | 'different';

//    /**
//     * Is expandable, until count is reach. Default false
//     */
//    expandable?: boolean;
// }

// class ResourcePlaceholderLineStock implements IResourceLineStock {
//    private placeholders: ResourcePlaceholder[] = [];

//    constructor(
//       private element: HTMLElement,
//       private count: number,
//       private settings?: ResourcePlaceholderLineStockSettings,
//    ) {
//       const restriction = settings?.restriction ?? 'none';
//       if (settings.expandable ?? false) {
//          // Do nothing
//       } else {
//          for (let index = 0; index < count; index++) {
//             this.placeholders.push(new ResourcePlaceholder(element));
//             if (restriction == 'same') {
//                element.insertAdjacentHTML('beforeend', ResourceHelper.getIconSame());
//             } else if (restriction == 'different') {
//                element.insertAdjacentHTML('beforeend', ResourceHelper.getIconDifferent());
//             }
//          }
//       }
//    }

//    addPlaceholder() {
//       this.placeholders.push(new ResourcePlaceholder(this.element));
//    }

//    countPlaceholder(): number {
//       return this.placeholders.length;
//    }

//    isExpandable(): boolean {
//       return this.settings?.expandable ?? false;
//    }

//    add(resource: string) {
//       const count = this.getResources().length;
//       this.placeholders[count].add(resource);
//    }

//    isFull(): boolean {
//       return this.placeholders.every((p) => p.getResource() != null);
//    }

//    getResources(): string[] {
//       return this.placeholders.map((p) => p.getResource()).filter((r) => r !== null);
//    }

//    reset() {
//       if (this.settings?.expandable ?? false) {
//          this.placeholders.forEach((p) => p.destroy());
//          this.placeholders = [];
//       } else {
//          this.placeholders.forEach((p) => p.reset());
//       }
//    }
// }

// interface IResourceLineStock {
//    add(resource: string): void;
//    getResources(): string[];
//    reset(): void;
//    isFull(): boolean;
// }

// class ResourceTrader {
//    private element: HTMLElement;

//    private resources_from: ResourcePlaceholderLineStock;
//    private resources_to: ResourcePlaceholderLineStock;

//    constructor(
//       parent: HTMLElement,
//       id: string,
//       private to: string[],
//       private from?: string[],
//       private restriction?: 'same' | 'different',
//    ) {
//       const resource_to_display =
//          this.to[0] !== '*' ? this.to.map((icon) => ResourceHelper.getElement(icon)).join('') : '';

//       const html = `<div id="${id}" class="line">
//          <div class="resource-converter-placeholder-from"></div>
//          <div class="wrapper no-border arrow"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 16 16"><path fill="lime" d="M15.5 8L8 .5V5H0v6h8v4.5z"/></svg></div>
//          <div class="wrapper no-border to">${resource_to_display}</div>
//          <div class="resource-converter-placeholder"></div>
//       </div>`;
//       parent.insertAdjacentHTML('beforeend', html);
//       this.element = document.getElementById(id);

//       if (this.from) {
//          this.resources_from = new ResourcePlaceholderLineStock(
//             this.element.querySelector('.resource-converter-placeholder-from'),
//             from.length,
//             {
//                restriction,
//             },
//          );
//       }

//       if (this.to[0] == '*') {
//          this.resources_to = new ResourcePlaceholderLineStock(
//             this.element.querySelector('.resource-converter-placeholder'),
//             to.length,
//             {},
//          );
//       }
//    }
// }

// class ResourceHelper {
//    static getElement(type: string) {
//       return `<div class="resource-icon" data-type="${type}"></div>`;
//    }
//    static getIconSame() {
//       return '<div class="resource-icon same"></div>';
//    }
//    static getIconDifferent() {
//       return '<div class="resource-icon different"></div>';
//    }
//    static convertToInt(icons: string[]): number[] {
//       return icons.map((type) => ICONS.indexOf(type) + 1);
//    }

//    static isRequirementMet(game: CreatureConforts, cost: { [type: string]: number }): boolean {
//       const { counters } = game.getPlayerPanel(game.getPlayerId());

//       for (const type of Object.keys(cost)) {
//          if (type !== '*' && counters[type].getValue() < cost[type]) {
//             return false;
//          }
//       }

//       if ('*' in cost) {
//          const total_goods = GOODS.map((type) => counters[type].getValue()).reduce(
//             (prev, curr) => prev + curr,
//             0,
//          );

//          const total_cost = Object.keys(cost)
//             .filter((type) => GOODS.indexOf(type) >= 0)
//             .map((type) => cost[type])
//             .reduce((prev, curr) => prev + curr, 0);

//          return total_goods >= total_cost;
//       }

//       return true;
//    }
// }
