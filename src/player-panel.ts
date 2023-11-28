class PlayerPanel {
   public player_id: number;
   public counters: { [icon: string]: ebg.counter } = {};
   private almanac: number = 0;
   private wheelbarrow: number = 0;

   constructor(public game: CreatureConforts, player: CreatureConfortsPlayerData) {
      this.player_id = Number(player.id);

      const templateIcon = `<div class="wrapper">
         <span id="player-panel-${player.id}-icons-{icon-value}-counter" class="counter">1</span>
         <div class="resource-icon" data-type="{icon-value}"></div>
      </div>`;

      const html = `<div id="player-panel-${player.id}-icons" class="icons counters">
        ${ICONS.map((icon) => templateIcon.replaceAll('{icon-value}', icon)).join(' ')}
        <div class="row"></div>
      </div>`;

      document.getElementById(`player_board_${player.id}`).insertAdjacentHTML('beforeend', html);

      ICONS.forEach((icon) => {
         let value = player[icon];
         if (isNaN(value)) {
            value = 0;
         }
         const counter = new ebg.counter();
         counter.create(`player-panel-${player.id}-icons-${icon}-counter`);
         counter.setValue(value);
         this.counters[icon] = counter;
      });

      if (this.player_id == game.gamedatas.first_player_id) {
         this.addFirstTokenPlayer();
      }

      for (let index = 0; index < Number(player.almanac); index++) {
         this.addAlmanac();
      }

      for (let index = 0; index < Number(player.wheelbarrow); index++) {
         this.addWheelbarrow();
      }
   }

   addFirstTokenPlayer() {
      // Remove first token player
      document.querySelectorAll(`.first-player-marker`).forEach((div) => div.remove());

      // Add first token player
      const container = document.querySelectorAll(`#player-panel-${this.player_id}-icons .row`)[0];
      container.insertAdjacentHTML('afterbegin', '<div class="first-player-marker"></div>');
   }

   addAlmanac() {
      const container = document.querySelectorAll(`#player-panel-${this.player_id}-icons .row`)[0];
      container.insertAdjacentHTML('beforeend', '<div class="almanac"></div>');
      this.almanac += 1;
   }

   addWheelbarrow() {
      const container = document.querySelectorAll(`#player-panel-${this.player_id}-icons .row`)[0];
      container.insertAdjacentHTML('beforeend', '<div class="wheelbarrow"></div>');
      this.wheelbarrow += 1;
   }

   countAlmanac() {
      return this.almanac;
   }

   hasWheelbarrow(): boolean {
      return this.wheelbarrow > 0;
   }
}
