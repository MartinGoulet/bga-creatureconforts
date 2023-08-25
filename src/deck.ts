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
         cardOverlap: "30px",
         cardShift: "6px",
         inclination: 6,
         sort: sortFunction("type_arg"),
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
      const copy = { ...card, type: "", type_arg: "" };
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
