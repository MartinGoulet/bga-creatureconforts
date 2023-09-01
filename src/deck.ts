class HiddenDeck<T extends Card> extends Deck<T> {
   constructor(protected manager: CardManager<T>, protected element: HTMLElement) {
      super(manager, element, {
         cardNumber: 0,
         counter: {
            hideWhenEmpty: false,
         },
         autoRemovePreviousCards: false,
      });
   }

   public addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardToDeckSettings): Promise<boolean> {
      settings = settings ?? {};
      settings.index = settings.index ?? 0;
      return super.addCard(card, animation, settings);
   }
}

class VisibleDeck<T extends Card> extends Deck<T> {
   constructor(protected manager: CardManager<T>, protected element: HTMLElement) {
      super(manager, element, {
         cardNumber: 0,
         counter: {
            hideWhenEmpty: false,
         },
         autoRemovePreviousCards: false,
      });
   }
}

class Hand extends HandStock<Card> {
   constructor(
      manager: CardManager<Card>,
      element: HTMLElement,
      protected current_player: boolean, // protected hand_counter: ebg.counter,
   ) {
      super(manager, element, {
         // center: true,
         // wrap: "wrap",
         cardOverlap: '30px',
         cardShift: '6px',
         inclination: 6,
         sort: sortFunction('type_arg'),
      });
   }

   public addCard(card: Card, animation?: CardAnimation<Card>, settings?: AddCardSettings): Promise<boolean> {
      const copy: Card = { ...card }; // { ...card, isHidden: !this.current_player };
      if (!this.current_player) {
         copy.type = null;
         copy.type_arg = null;
      }
      return new Promise<boolean>((resolve) => {
         super
            .addCard(copy, animation, settings)
            // .then(() => this.hand_counter.toValue(this.getCards().length))
            .then(() => resolve(true));
      });
   }

   public removeCard(card: Card, settings?: RemoveCardSettings): void {
      super.removeCard(card, settings);
      // this.hand_counter.toValue(this.getCards().length);
   }
}

class HiddenLineStock<T> extends LineStock<T> {
   constructor(manager: CardManager<T>, element: HTMLElement) {
      super(manager, element);
   }
   public addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean> {
      const copy = { ...card, type: '', type_arg: '' };
      return super.addCard(copy);
   }
}

class DiscardStock extends VisibleDeck<Card> {
   public onAddCard: (card: Card) => void;
   public onRemoveCard: (card: Card) => void;

   constructor(manager: CardManager<Card>, element: HTMLElement) {
      super(manager, element);
   }

   public addCard(
      card: Card,
      animation?: CardAnimation<Card>,
      settings?: AddCardToDeckSettings,
   ): Promise<boolean> {
      const promise = super.addCard(card, animation, settings);
      this.onAddCard({ ...card });
      return promise;
   }

   public removeCard(card: Card, settings?: RemoveCardSettings): void {
      const copy = { ...card };
      super.removeCard(card, settings);
      this.onRemoveCard(copy);
   }
}

class LocationStock extends SlotStock<Meeple> {
   OnLocationClick: (slotId: SlotId) => void;
   private selectedLocations: SlotId[] = [];

   constructor(
      protected manager: CardManager<Meeple>,
      protected element: HTMLElement,
      settings: SlotStockSettings<Meeple>,
   ) {
      super(manager, element, settings);
      const handleMeepleClick = (meeple) => {
         if (this.OnLocationClick && this.slots[meeple.location_arg].classList.contains('selectable')) {
            this.OnLocationClick(meeple.location_arg);
         }
      };
      this.onCardClick = handleMeepleClick;
   }

   protected createSlot(slotId: SlotId): void {
      super.createSlot(slotId);
      const handleClick = (ev: MouseEvent) => {
         if (this.OnLocationClick && (ev.target as HTMLDivElement).classList.contains('selectable')) {
            this.OnLocationClick(slotId);
         }
      };
      (this.slots[slotId] as HTMLDivElement).addEventListener('click', handleClick);
   }

   public getSelectedLocation(): SlotId[] {
      return this.selectedLocations;
   }

   public isSelectedLocation(slotId: SlotId): boolean {
      return this.slots[Number(slotId)].classList.contains('selected');
   }

   public setSelectableLocation(locations: SlotId[] = []): void {
      this.slots.forEach((slot) => {
         slot.classList.toggle('selectable', false);
      });
      locations.forEach((sel) => this.slots[sel].classList.toggle('selectable', true));
   }

   public setSelectedLocation(locations: SlotId[] = []): void {
      this.selectedLocations = locations;
      this.slots.forEach((slot) => {
         slot.classList.toggle('selected', false);
      });
      locations.forEach((sel) => this.slots[sel].classList.toggle('selected', true));
      this.element.classList.toggle('has-selected-location', locations.length > 0);
   }
}
