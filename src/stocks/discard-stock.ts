class DiscardStock<T> extends Deck<T> {
   private readonly eyeIcon: HTMLElement;

   constructor(manager: CardManager<T>, element: HTMLElement, private linestock?: LineStock<T>) {
      super(manager, element, {
         cardNumber: 0,
         counter: {
            hideWhenEmpty: false,
         },
         autoRemovePreviousCards: false,
      });

      if (linestock) {
         this.eyeIcon = document.createElement('div');
         this.eyeIcon.classList.add('eye-icon', 'closed');
         this.eyeIcon.onclick = () => this.onEyeClick();
         element.appendChild(this.eyeIcon);
      }

      element.classList.add('discard');
   }

   public addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardToDeckSettings): Promise<boolean> {
      const promise = super.addCard(card, animation, settings);
      this.linestock?.addCard({ ...card });
      return promise;
   }

   public removeCard(card: T, settings?: RemoveCardSettings): Promise<boolean> {
      const promise = super.removeCard(card, settings);
      this.linestock?.removeCard({ ...card });
      if (this.linestock?.getCards().length == 0) {
         this.eyeIcon.classList.toggle('closed', true);
         this.setClassToTable();
      }
      return promise;
   }

   private onEyeClick() {
      this.eyeIcon.classList.toggle('closed');
      this.setClassToTable();
   }

   private setClassToTable() {
      const opened = !this.eyeIcon.classList.contains('closed');
      const classCss = `${this.element.id}-opened`;
      document.getElementById('table').classList.toggle(classCss, opened);
   }
}
