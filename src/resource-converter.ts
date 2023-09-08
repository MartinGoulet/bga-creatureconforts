interface ResourceConverterSettings {
   /**
    * Settings for the from parameter
    */
   from?: {
      /**
       * Restriction on the from resource. Default: none;
       */
      restriction?: 'same' | 'different' | 'none';
      /**
       * Goods from player to show, Default: ICONS
       */
      allowed_resources?: string[];

      max?: number;
   };
}

class ResourceConverter {
   // Top left
   private resources_player: PlayerResourceCounter;
   // Top right
   private resources_board?: PlayerResourceCounter;
   // Bottom left
   private resources_give?: IResourceLineStock;
   // Bottom right
   private counter_reward: ebg.counter;
   private resource_get: ResourcePlaceholderLineStock;

   public OnResourceChanged?: (resources: string[]) => void;

   constructor(
      public game: CreatureConforts,
      private from: string[],
      private to: string[],
      private times: number,
      private settings?: ResourceConverterSettings,
   ) {}

   show() {
      this.removeControl();

      const count_any_ressource_to = this.to.filter((r) => r == '*').length;
      // Add container
      this.addBanner(count_any_ressource_to);
      // Top left
      this.addControlResourcesPlayer();
      // Bottom left
      this.addControlResourceGive();
      // Top right
      this.addControlResourceBoard(count_any_ressource_to);
      // Bottom right
      this.addControlResourceGet(count_any_ressource_to);
      // Add buttons
      this.addResetButton();
   }

   hide() {
      this.removeControl();
   }

   getResourcesGive(): string[] {
      return this.resources_give.getResources();
   }

   getResourcesGet(): string[] {
      return this.resource_get.getResources();
   }

   private addBanner(count_any_ressource_to: number) {
      const arrow =
         count_any_ressource_to > 0
            ? `<div class="wrapper no-border arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 16 16"><path fill="lime" d="M15.5 8L8 .5V5H0v6h8v4.5z"/></svg>
               </div>`
            : '';

      const html = `<div id="resource-converter">
         <div class="line">
            <div id="resource-converter-player"></div>
            ${arrow}
            <div id="resource-converter-board-resources"></div>
         </div>
         <div class="line">
            <div id="resource-converter-placeholder-from"></div>
            <div class="wrapper no-border from"></div>
            <div class="wrapper no-border arrow">
               <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 16 16"><path fill="lime" d="M15.5 8L8 .5V5H0v6h8v4.5z"/></svg>
               ${this.times > 1 ? `x${this.times}` : ''}
            </div>
            <div class="wrapper no-border to">
               <span id="tc-icons-reward-counter" class="counter">1</span>
               ${this.to.map((icon) => ResourceHelper.getElement(icon))}
            </div>
            <div id="resource-converter-placeholder"></div>
            <div id="resource-converter-buttons"></div>
         </div>
      </div>`;

      document.getElementById(`maintitlebar_content`).insertAdjacentHTML('beforeend', html);
   }

   private addControlResourcesPlayer() {
      const handleResourceClick = (type: string) => {
         this.resources_give.add(type);

         if (this.counter_reward) {
            if (this.from.length == 1) {
               this.counter_reward.incValue(1);
            } else if (this.from.length > 1 && this.from.every((icon) => icon == '*')) {
               this.counter_reward.setValue(
                  Math.floor(this.resources_give.getResources().length / this.from.length),
               );
            } else {
               // Get min count of type
               const values: number[] = [];
               this.from.forEach((icon) => {
                  values.push(this.resources_give.getResources().filter((type) => type == icon).length);
               });
               this.counter_reward.setValue(Math.min.apply(null, values));
            }
         }

         if (this.counter_reward?.getValue() >= this.times || this.resources_give.isFull()) {
            this.resources_player.disabled();
         }
         if (this.settings?.from?.max ?? 0 == this.resources_give.getResources().length) {
            this.resources_player.disabled();
         }
      };

      const element = document.getElementById('resource-converter-player');
      this.resources_player = new PlayerResourceCounter(this.game, element, 'player-counter', {
         icons: this.getAllowedResources(),
      });
      this.resources_player.onResourceClick = (type) => handleResourceClick(type);
   }

   private addControlResourceGive() {
      if ((this.from && this.from.every((r) => r == '*') && this.times == 1) || this.settings?.from?.max) {
         const element = document.getElementById('resource-converter-placeholder-from');
         this.resources_give = new ResourcePlaceholderLineStock(element, this.from.length, {
            restriction: this.settings?.from?.restriction,
         });
      } else {
         this.resources_give = new ResourceLineStock(document.querySelector('#resource-converter .from'));
      }
   }

   private addControlResourceBoard(count_any_ressource_to: number) {
      if (count_any_ressource_to == 0) {
         document.getElementById('resource-converter-placeholder').remove();
      } else {
         const element = document.getElementById('resource-converter-board-resources');
         this.resources_board = new PlayerResourceCounter(this.game, element, 'board-resources', {
            icons: GOODS,
            initialValue: 20,
         });
         this.resources_board.onResourceClick = (type) => this.handleBoardResourceClick(type);

         document.querySelector('#resource-converter .wrapper.to').remove();
      }
   }

   private addControlResourceGet(count_any_ressource_to: number) {
      if (document.getElementById('tc-icons-reward-counter')) {
         this.counter_reward = createCounter('tc-icons-reward-counter');
      }
      const element = document.getElementById('resource-converter-placeholder');
      this.resource_get = new ResourcePlaceholderLineStock(element, count_any_ressource_to);
   }

   private addResetButton() {
      const handleReset = () => {
         this.resources_give.reset();
         this.counter_reward?.setValue(0);
         this.resources_player.reset();
         this.resource_get.reset();
         this.resources_board?.reset();
      };
      this.game.addActionButtonReset('resource-converter-buttons', handleReset);
   }

   private getAllowedResources(): string[] {
      if (this.settings?.from?.allowed_resources) {
         return this.settings.from.allowed_resources;
      } else {
         return this.from.indexOf('*') >= 0 ? GOODS : this.from ?? ICONS;
      }
   }

   private handleBoardResourceClick(type: string) {
      this.resource_get.add(type);
      if (this.resource_get.isFull()) {
         this.resources_board.disabled();
      }
   }

   private removeControl() {
      const root = document.getElementById('resource-converter');
      if (root) root.remove();
      this.resources_player = null;
   }
}
