interface ResourceManagerPayForSettings<TResource> {
   from: {
      available: IResourceCounterSettings<TResource>[];
      requirement?: TResource[];
      count: number;
      /**
       * Add restriction for resource groupe
       */
      restriction?: 'same' | 'different' | 'all_same' | 'all_different';
   };
   to: {
      available?: TResource[];
      resources?: TResource[];
      count?: number;
      restriction?: 'same' | 'different' | 'all_same' | 'all_different';
   };
   times: number;
}

class ResourceManagerPayFor<TResource> implements IResourceManager<TResource> {
   private readonly resource_player: ResourceCounterLineStock<TResource>;
   private readonly resource_trader: ResourceTrader<TResource>[] = [];
   private readonly resource_board?: ResourceCounterLineStock<TResource>;

   private readonly traders: HTMLElement;

   constructor(root: HTMLElement, private settings: ResourceManagerPayForSettings<TResource>) {
      root.classList.add('resource-container');
      root.classList.add('resource-manager-pay-for');

      this.resource_player = new ResourceCounterLineStock<TResource>(root, {
         resources: settings.from.available,
      });

      if (settings.to.available) {
         root.appendChild(this.createArrow());
         this.resource_board = new ResourceCounterLineStock<TResource>(root, {
            resources: settings.to.available.map((p) => {
               return {
                  resource: p,
                  initialValue: 1,
               } as IResourceCounterSettings<TResource>;
            }),
            classList: ['resource-board'],
         });
         this.resource_board.onClick = (type: TResource) => this.handleResourceBoardClick(type);
      }

      root.appendChild(this.createSpacer());

      this.traders = this.createTraders();
      root.appendChild(this.traders);
      this.addResourceTrader();

      this.resource_player.onClick = (type: TResource) => this.handleResourcePlayerClick(type);
   }

   getResourcesFrom(): TResource[] {
      return this.resource_trader.filter((t) => t.isComplete()).flatMap((t) => t.getFrom());
   }
   getResourcesTo(): TResource[] {
      return this.resource_trader.filter((t) => t.isComplete()).flatMap((t) => t.getTo());
   }
   reset() {
      this.resource_board?.reset();
      this.resource_player.reset();
      this.resource_trader.forEach((t) => t.destroy());
      this.resource_trader.splice(0);
      this.addResourceTrader();
   }
   hasTradePending(): boolean {
      return !this.resource_trader.every((t) => t.isComplete());
   }

   private addResourceTrader(): ResourceTrader<TResource> {
      const { from, to } = this.settings;
      const trader = new ResourceTrader<TResource>(this.traders, {
         from: {
            count: from.count,
            resources: from.requirement,
            restriction: from.restriction,
         },
         to: {
            count: to.count,
            resources: to.resources,
            restriction: to.restriction,
         },
      });

      this.resource_trader.push(trader);

      if (from.restriction) {
         if (from.restriction === 'all_different') {
            console.log(from.restriction);
            trader.element.insertAdjacentElement('afterbegin', this.createDifferentIcon());
         }
         if (from.restriction === 'all_same') {
            trader.element.insertAdjacentElement('afterbegin', this.createSameIcon());
         }
      }

      if (to.restriction) {
         if (to.restriction === 'all_different') {
            trader.element.appendChild(this.createDifferentIcon());
         }
         if (to.restriction === 'all_same') {
            trader.element.appendChild(this.createSameIcon());
         }
      }

      return trader;
   }

   private createArrow(): HTMLElement {
      const divSpacer = document.createElement('div');
      divSpacer.classList.add('arrow');
      return divSpacer;
   }
   private createSpacer(): HTMLElement {
      const divSpacer = document.createElement('div');
      divSpacer.classList.add('spacer');
      return divSpacer;
   }
   private createTraders(): HTMLElement {
      const divTrader = document.createElement('div');
      divTrader.classList.add('resource-traders');
      return divTrader;
   }

   private handleResourceBoardClick(type: TResource) {
      let trader = this.resource_trader.find((p) => !p.isFullTo() && p.canAddTo(type));
      if (trader) {
         trader.addTo(type);
      }
      if (this.settings.to.restriction === 'all_same') {
         this.settings.to.available
            ?.filter((p) => p !== type)
            .forEach((p) => {
               this.resource_board!.disableResource(p);
            });
         this.resource_player.disableResource(type);
      }
      return false;
   }

   private handleResourcePlayerClick(type: TResource): boolean | undefined {
      let trader = this.resource_trader.find((p) => !p.isFullFrom() && p.canAddFrom(type));
      if (trader === undefined) {
         if (this.resource_trader.length < this.settings.times) {
            trader = this.addResourceTrader();
         } else {
            return false;
         }
      }

      trader.addFrom(type);

      let last_trader = this.resource_trader.find((p) => !p.isFullFrom() && p.canAddFrom(type));
      if (last_trader === undefined && this.resource_trader.length < this.settings.times) {
         last_trader = this.addResourceTrader();
      }

      if (!last_trader?.canAddFrom(type) || this.settings.from.restriction === 'all_different') {
         this.resource_player.disableResource(type);
      }

      if (this.resource_trader.every((p) => p.isFullFrom())) {
         this.resource_player.disable();
      }
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
}
