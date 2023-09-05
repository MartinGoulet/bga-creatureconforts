const icons = ['wood', 'stone', 'fruit', 'mushroom', 'yarn', 'grain'];

class ChooseResource {
   public counters: { [icon: string]: ebg.counter } = {};
   private placeholder: string[] = [];

   constructor(public game: CreatureConforts, private player_id: number) {
      let root = document.getElementById('choose-resource');
      if (root) root.remove();

      const icons = ['wood', 'stone', 'fruit', 'mushroom', 'yarn', 'grain'];

      const templateIcon = `<div class="wrapper">
         <span id="icons-{icon-value}-counter" class="counter">1</span>
         <div class="resource-icon" data-type="{icon-value}"></div>
      </div>`;

      const html = `<div id="choose-resource">
         <div id="choose-resource-player">
            ${icons.map((icon) => templateIcon.replaceAll('{icon-value}', icon)).join(' ')}
         </div>
         <div id="choose-resource-placeholder"></div>
         <div id="choose-resource-buttons"></div>
      </div>`;

      document.getElementById(`maintitlebar_content`).insertAdjacentHTML('beforeend', html);
      for (const icon of icons) {
         this.counters[icon] = new ebg.counter();
         this.counters[icon].create(`icons-${icon}-counter`);
         this.counters[icon].setValue(0);
      }

      const handleReset = () => {
         this.placeholder = [];
         this.displayPlaceholder();
         this.displayResource();
      };

      this.game.addActionButton(
         'choose-resource-button-reset',
         _('Reset'),
         handleReset,
         'choose-resource-buttons',
         false,
         'gray',
      );
   }

   display(cost: { [type: string]: number }) {
      const handleResourceClick = (type: string, counter: ebg.counter, wrapper: HTMLDivElement) => {
         if (counter.getValue() <= 0) return;
         if (this.placeholder.length >= cost['*']) return;
         counter.incValue(-1);
         wrapper.classList.toggle('disabled', counter.getValue() == 0);
         this.placeholder.push(type);
         this.displayPlaceholder();
      };

      this.placeholder = [];
      const player_resource = this.game.getPlayerPanel(this.player_id).counters;

      for (const type of icons) {
         const counter = player_resource[type];
         this.counters[type].setValue(counter.getValue());
         const wrapper = document.getElementById(`icons-${type}-counter`).parentElement as HTMLDivElement;
         wrapper.classList.toggle('disabled', this.counters[type].getValue() == 0);
         wrapper.addEventListener('click', () => handleResourceClick(type, this.counters[type], wrapper));
      }

      const html: string[] = [];
      for (let index = 0; index < cost['*']; index++) {
         html.push(`<div id="placeholder-${index}" class="placeholder"></div>`);
      }

      const placeholder = document.getElementById('choose-resource-placeholder');
      placeholder.innerHTML = '';
      placeholder.insertAdjacentHTML('beforeend', html.join(''));

      document.getElementById('choose-resource').classList.toggle('show', true);
   }

   hide() {
      document.getElementById('choose-resource').classList.toggle('show', false);
   }

   private displayResource() {
      const player_resource = this.game.getPlayerPanel(this.player_id).counters;
      for (const type of icons) {
         const counter = player_resource[type];
         this.counters[type].setValue(counter.getValue());
         const wrapper = document.getElementById(`icons-${type}-counter`).parentElement as HTMLDivElement;
         wrapper.classList.toggle('disabled', this.counters[type].getValue() == 0);
      }
   }

   private displayPlaceholder() {
      document.querySelectorAll(`#choose-resource-placeholder .placeholder`).forEach((placeholder) => {
         placeholder.innerHTML = ``;
      });
      for (let index = 0; index < this.placeholder.length; index++) {
         const type = this.placeholder[index];
         const placeholder = document.getElementById(`placeholder-${index}`);
         placeholder.insertAdjacentHTML(`beforeend`, `<div class="resource-icon" data-type="${type}"></div>`);
      }
   }
}
