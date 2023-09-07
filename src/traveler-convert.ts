class TravelerConvert {
   public counters: { [icon: string]: ebg.counter } = {};
   private reward: TravelerReward;
   public resources: string[] = [];
   public player_id: number;

   public OnResourceChanged?: (resources: string[]) => void;

   constructor(public game: CreatureConforts) {}

   public show(reward: TravelerReward, player_id: number) {
      this.reward = reward;
      this.player_id = player_id;
      this.resources = [];

      this.removeControl();
      this.addControl(reward, player_id);
      this.addResetButton();
   }

   public hide() {
      this.removeControl();
   }

   private addControl(reward: TravelerReward, player_id: number) {
      const handleResourceClick = (type: string, counter: ebg.counter) => {
         if (counter.getValue() <= 0) return;
         if (this.resources.length >= this.reward.times) return;

         counter.incValue(-1);
         this.resources.push(type);

         if (reward.from.length == 1) {
            this.counters['reward'].incValue(1);
         } else {
            const values: number[] = [];
            this.reward.from.forEach((icon) => {
               values.push(this.resources.filter((type) => type == icon).length);
            });
            this.counters['reward'].setValue(Math.min.apply(null, values));
         }

         this.setActiveResource();
         this.displayResources();
      };

      const templateIcon = `<div class="wrapper">
          <span id="tc-icons-{icon}-counter" class="counter">1</span>
          <div class="resource-icon" data-type="{icon}"></div>
       </div>`;

      const html_to = reward.to.map((icon) => `<div class="resource-icon" data-type="${icon}"></div>`);

      const html = `<div id="traveler-convert">
         <div id="traveler-convert-player">
             ${ICONS.map((icon) => templateIcon.replaceAll('{icon}', icon)).join(' ')}
          </div>
         <div class="wrapper no-border from"></div>
         <div class="wrapper no-border">=> (max x${reward.times})</div>
         <div class="wrapper no-border to">
            <span id="tc-icons-reward-counter" class="counter">1</span>
            ${html_to}
         </div>
         <div id="traveler-convert-buttons"></div>
      </div>`;

      document.getElementById(`maintitlebar_content`).insertAdjacentHTML('beforeend', html);

      this.createCounter('reward', 'tc-icons-reward-counter', 0);

      const player_resource = this.game.getPlayerPanel(player_id).counters;
      for (const icon of ICONS) {
         this.createCounter(icon, `tc-icons-${icon}-counter`, player_resource[icon].getValue());

         if (this.counters[icon].getValue() > 0) {
            const wrapper = document.getElementById(`tc-icons-${icon}-counter`)
               .parentElement as HTMLDivElement;
            wrapper.addEventListener('click', (e: MouseEvent) => {
               e.preventDefault();
               e.stopPropagation();
               handleResourceClick(icon, this.counters[icon]);
            });
         }
      }

      this.setActiveResource();
   }

   private addResetButton() {
      const handleReset = () => {
         this.resources = [];
         this.counters['reward'].setValue(0);
         this.resetResourcesValues();
         this.setActiveResource();
         this.displayResources();
      };

      this.game.addActionButton(
         'btn_reset',
         _('Reset'),
         handleReset,
         'traveler-convert-buttons',
         false,
         'gray',
      );
   }

   private createCounter(name: string, element: string, value: number) {
      this.counters[name] = new ebg.counter();
      this.counters[name].create(element);
      this.counters[name].setValue(value);
   }

   private displayResources() {
      const container = document.querySelectorAll('#traveler-convert .from')[0] as HTMLDivElement;
      const resources = this.resources.map((icon) => `<div class="resource-icon" data-type="${icon}"></div>`);
      container.innerHTML = '';
      container.insertAdjacentHTML('beforeend', resources.join(''));
   }

   getResources(): number[] {
      return this.resources.map((type) => ICONS.indexOf(type) + 1);
   }

   private removeControl() {
      const root = document.getElementById('traveler-convert');
      if (root) root.remove();
      this.counters = {};
   }

   private resetResourcesValues() {
      const player_resource = this.game.getPlayerPanel(this.player_id).counters;

      for (const icon of ICONS) {
         this.counters[icon].setValue(player_resource[icon].getValue());
      }
   }

   private setActiveResource() {
      for (const icon of ICONS) {
         const wrapper = document.getElementById(`tc-icons-${icon}-counter`).parentElement as HTMLDivElement;
         if (this.counters[icon].getValue() == 0 || this.resources.length == this.reward.times) {
            wrapper.classList.toggle('disabled', true);
         } else if (this.reward.from.indexOf('*') >= 0) {
            wrapper.classList.toggle('disabled', GOODS.indexOf(icon) < 0);
         } else {
            wrapper.classList.toggle('disabled', this.reward.from.indexOf(icon) < 0);
         }
      }
   }

   ////

   // getResources(): number[] {
   //    return this.placeholder.map((type) => GOODS.indexOf(type) + 1);
   // }

   // display(cost: { [type: string]: number }) {
   //    this.cost = cost;
   //    const handleResourceClick = (type: string, counter: ebg.counter, wrapper: HTMLDivElement) => {
   //       if (counter.getValue() <= 0) return;
   //       if (this.placeholder.length >= cost['*']) return;
   //       counter.incValue(-1);
   //       wrapper.classList.toggle('disabled', counter.getValue() == 0);
   //       this.placeholder.push(type);
   //       this.displayPlaceholder();
   //       this.OnResourceChanged?.(this.placeholder.slice());
   //    };

   //    this.placeholder = [];
   //    const player_resource = this.game.getPlayerPanel(this.player_id).counters;

   //    for (const type of GOODS) {
   //       const counter = player_resource[type];
   //       if (type in cost) {
   //          this.counters[type].setValue(counter.getValue() - cost[type]);
   //       } else {
   //          this.counters[type].setValue(counter.getValue());
   //       }
   //       const wrapper = document.getElementById(`icons-${type}-counter`).parentElement as HTMLDivElement;
   //       wrapper.classList.toggle('disabled', this.counters[type].getValue() == 0);
   //       if (!this.isHandleSet) {
   //          wrapper.addEventListener('click', () => handleResourceClick(type, this.counters[type], wrapper));
   //       }
   //    }

   //    this.isHandleSet = true;

   //    const html: string[] = [];
   //    for (let index = 0; index < cost['*']; index++) {
   //       html.push(`<div id="placeholder-${index}" class="placeholder"></div>`);
   //    }

   //    const placeholder = document.getElementById('select-resources-placeholder');
   //    placeholder.innerHTML = '';
   //    placeholder.insertAdjacentHTML('beforeend', html.join(''));

   //    document.getElementById('select-resources').classList.toggle('show', true);
   // }

   // hide() {
   //    document.getElementById('select-resources').classList.toggle('show', false);
   // }

   // private displayResource() {
   //    const player_resource = this.game.getPlayerPanel(this.player_id).counters;
   //    for (const type of GOODS) {
   //       const counter = player_resource[type];
   //       if (type in this.cost) {
   //          this.counters[type].setValue(counter.getValue() - this.cost[type]);
   //       } else {
   //          this.counters[type].setValue(counter.getValue());
   //       }

   //       const wrapper = document.getElementById(`icons-${type}-counter`).parentElement as HTMLDivElement;
   //       wrapper.classList.toggle('disabled', this.counters[type].getValue() == 0);
   //    }
   // }

   // private displayPlaceholder() {
   //    document.querySelectorAll(`#select-resources-placeholder .placeholder`).forEach((placeholder) => {
   //       placeholder.innerHTML = ``;
   //    });
   //    for (let index = 0; index < this.placeholder.length; index++) {
   //       const type = this.placeholder[index];
   //       const placeholder = document.getElementById(`placeholder-${index}`);
   //       placeholder.insertAdjacentHTML(`beforeend`, `<div class="resource-icon" data-type="${type}"></div>`);
   //    }
   // }
}
