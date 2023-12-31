class Hand<T> extends HandStock<T> {
   constructor(
      manager: CardManager<T>,
      element: HTMLElement,
      protected current_player: boolean,
      protected hand_counter: ebg.counter,
   ) {
      super(manager, element, {
         cardOverlap: '10px',
         cardShift: '5px',
         inclination: 6,
         sort: sortFunction('id'),
      });
   }

   public addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean> {
      const { id } = card as Card;
      const copy: T = this.current_player ? { ...card } : ({ id } as T);

      return new Promise<boolean>((resolve) => {
         super
            .addCard(copy, animation, settings)
            .then(() => this.hand_counter.toValue(this.getCards().length))
            .then(() => resolve(true));
      });
   }

   public removeCard(card: T, settings?: RemoveCardSettings): Promise<boolean> {
      return new Promise<boolean>((resolve) => {
         super
            .removeCard(card, settings)
            .then(() => this.hand_counter.toValue(this.getCards().length))
            .then(() => resolve(true));
      });
   }
}
