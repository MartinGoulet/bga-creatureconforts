class Modal {
   public cards: LineStock<Card>;
   private onClose: () => void;

   constructor(private game: CreatureComforts) {
      const display = document.getElementById('modal-display');
      if (display) {
         display.parentElement.removeChild(display);
      }

      const html = `<div id="modal-display">
         <div id="modal-display-card"></div>
        </div>`;

      const elBody = document.getElementById('ebd-body');

      elBody.insertAdjacentHTML('beforeend', html);

      const handleKeyboard = (ev: KeyboardEvent) => {
         if (elBody.classList.contains('modal_open')) {
            if (ev.key == 'Escape') {
               this.close();
            }
         }
      };

      document.getElementById('modal-display').addEventListener('click', () => this.close());
      elBody.addEventListener('keydown', handleKeyboard);
   }

   displayImprovement(card: ImprovementCard) {
      const el = document.getElementById('modal-display-card');
      const stock = new LineStock<ImprovementCard>(new ImprovementManager(this.game, 'modal', true), el);
      stock.addCard(card);
      this.onClose = () => {
         stock.removeCard(card);
      };
      this.adjustPosition();
   }

   displayTraveler(card: TravelerCard) {
      const el = document.getElementById('modal-display-card');
      const stock = new LineStock<TravelerCard>(new TravelerManager(this.game, 'modal'), el);
      stock.addCard(card);
      this.onClose = () => {
         stock.removeCard(card);
      };
      this.adjustPosition();
   }

   displayValley(card: ValleyCard) {
      const el = document.getElementById('modal-display-card');
      const stock = new LineStock<ValleyCard>(new ValleyManager(this.game, 'modal'), el);
      stock.addCard(card);
      this.onClose = () => {
         stock.removeCard(card);
      };
      this.adjustPosition();
   }

   displayConfort(card: ConfortCard) {
      const el = document.getElementById('modal-display-card');
      const stock = new LineStock<ConfortCard>(new ComfortManager(this.game, 'modal'), el);
      stock.addCard(card);
      this.onClose = () => {
         stock.removeCard(card);
      };
      this.adjustPosition();
   }

   private adjustPosition() {
      const scrollY = window.scrollY;

      const body = document.getElementById('ebd-body');
      body.classList.toggle('modal_open', true);
      body.style.top = `-${scrollY}px`;

      const display = document.getElementById('modal-display');
      display.style.top = `${scrollY}px`;
   }

   close() {
      const body = document.getElementById('ebd-body');
      body.classList.toggle('modal_open', false);
      body.style.top = ``;

      const display = document.getElementById('modal-display');
      const scrollY = Number(display.style.top.replace('px', ''));
      display.style.top = `${scrollY}px`;

      window.scroll(0, scrollY);

      this.onClose();
   }
}
