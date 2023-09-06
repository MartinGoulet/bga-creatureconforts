class SelectResources {
   public counters: { [icon: string]: ebg.counter } = {};
   private placeholder: string[] = [];
   private cost: { [type: string]: number };
   private isHandleSet: boolean = false;

   public OnResourceChanged?: (resources: string[]) => void;

   constructor(public game: CreatureConforts, private player_id: number) {
      let root = document.getElementById('select-resources');
      if (root) root.remove();

      const templateIcon = `<div class="wrapper">
         <span id="icons-{icon-value}-counter" class="counter">1</span>
         <div class="resource-icon" data-type="{icon-value}"></div>
      </div>`;

      const html = `<div id="select-resources">
         <div id="select-resources-player">
            ${GOODS.map((icon) => templateIcon.replaceAll('{icon-value}', icon)).join(' ')}
         </div>
         <div id="select-resources-placeholder"></div>
         <div id="select-resources-buttons"></div>
      </div>`;

      document.getElementById(`maintitlebar_content`).insertAdjacentHTML('beforeend', html);
      for (const icon of GOODS) {
         this.counters[icon] = new ebg.counter();
         this.counters[icon].create(`icons-${icon}-counter`);
         this.counters[icon].setValue(0);
      }

      const handleReset = () => {
         this.placeholder = [];
         this.displayPlaceholder();
         this.displayResource();
         this.OnResourceChanged?.(this.placeholder);
      };

      this.game.addActionButton(
         'select-resources-button-reset',
         _('Reset'),
         handleReset,
         'select-resources-buttons',
         false,
         'gray',
      );
   }

   getResources(): number[] {
      return this.placeholder.map((type) => GOODS.indexOf(type) + 1);
   }

   display(cost: { [type: string]: number }) {
      this.cost = cost;
      const handleResourceClick = (type: string, counter: ebg.counter, wrapper: HTMLDivElement) => {
         if (counter.getValue() <= 0) return;
         if (this.placeholder.length >= cost['*']) return;
         counter.incValue(-1);
         wrapper.classList.toggle('disabled', counter.getValue() == 0);
         this.placeholder.push(type);
         this.displayPlaceholder();
         this.OnResourceChanged?.(this.placeholder.slice());
      };

      this.placeholder = [];
      const player_resource = this.game.getPlayerPanel(this.player_id).counters;

      for (const type of GOODS) {
         const counter = player_resource[type];
         if (type in cost) {
            this.counters[type].setValue(counter.getValue() - cost[type]);
         } else {
            this.counters[type].setValue(counter.getValue());
         }
         const wrapper = document.getElementById(`icons-${type}-counter`).parentElement as HTMLDivElement;
         wrapper.classList.toggle('disabled', this.counters[type].getValue() == 0);
         if (!this.isHandleSet) {
            wrapper.addEventListener('click', () => handleResourceClick(type, this.counters[type], wrapper));
         }
      }

      this.isHandleSet = true;

      const html: string[] = [];
      for (let index = 0; index < cost['*']; index++) {
         html.push(`<div id="placeholder-${index}" class="placeholder"></div>`);
      }

      const placeholder = document.getElementById('select-resources-placeholder');
      placeholder.innerHTML = '';
      placeholder.insertAdjacentHTML('beforeend', html.join(''));

      document.getElementById('select-resources').classList.toggle('show', true);
   }

   hide() {
      document.getElementById('select-resources').classList.toggle('show', false);
   }

   private displayResource() {
      const player_resource = this.game.getPlayerPanel(this.player_id).counters;
      for (const type of GOODS) {
         const counter = player_resource[type];
         if (type in this.cost) {
            this.counters[type].setValue(counter.getValue() - this.cost[type]);
         } else {
            this.counters[type].setValue(counter.getValue());
         }

         const wrapper = document.getElementById(`icons-${type}-counter`).parentElement as HTMLDivElement;
         wrapper.classList.toggle('disabled', this.counters[type].getValue() == 0);
      }
   }

   private displayPlaceholder() {
      document.querySelectorAll(`#select-resources-placeholder .placeholder`).forEach((placeholder) => {
         placeholder.innerHTML = ``;
      });
      for (let index = 0; index < this.placeholder.length; index++) {
         const type = this.placeholder[index];
         const placeholder = document.getElementById(`placeholder-${index}`);
         placeholder.insertAdjacentHTML(`beforeend`, `<div class="resource-icon" data-type="${type}"></div>`);
      }
   }
}
