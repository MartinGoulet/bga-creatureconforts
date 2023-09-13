class Modal {
   public cards: LineStock<Card>;

   constructor(private game: CreatureConforts) {
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
      const front = this.addDivCard('improvement');
      front.dataset.type = card.type;
      this.adjustPosition();
   }

   displayTraveler(card: TravelerCard) {
      const front = this.addDivCard('traveler');
      front.dataset.type = card.type;
      this.adjustPosition();
   }

   displayValley(card: ValleyCard) {
      const front = this.addDivCard('valley');
      front.parentElement.parentElement.classList.add(card.location);
      front.dataset.type = card.type;
      front.dataset.image_pos = '' + this.game.gamedatas.valley_types[Number(card.type_arg)].image_pos;
      this.adjustPosition();
   }

   displayConfort(card: ConfortCard) {
      const front = this.addDivCard('confort');
      front.dataset.type = card.type;
      front.dataset.pos = card.type_arg;
      front.classList.toggle('background_1', Number(card.type) <= 12);
      front.classList.toggle('background_2', Number(card.type) > 12 && Number(card.type) <= 24);
      this.adjustPosition();
   }

   private addDivCard(type: 'improvement' | 'traveler' | 'confort' | 'valley') {
      const html = `<div id="modal-card" class="card ${type}">
         <div class="card-sides">
            <div id="modal-card-front" class="card-side front"></div>
         </div>
      </div>`;

      document.getElementById('modal-card')?.remove();
      document.getElementById('modal-display-card').insertAdjacentHTML('beforeend', html);

      return document.getElementById('modal-card-front');
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
   }
}
