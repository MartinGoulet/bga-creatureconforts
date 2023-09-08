class PlayerPanel {
   public player_id: number;
   public counters: { [icon: string]: ebg.counter } = {};

   constructor(public game: CreatureConforts, player: CreatureConfortsPlayerData) {
      this.player_id = Number(player.id);

      const icons = [...GOODS, 'lesson', 'story', 'coin'];

      const templateIcon = `<div class="wrapper">
         <span id="player-panel-${player.id}-icons-{icon-value}-counter" class="counter">1</span>
         <div class="resource-icon" data-type="{icon-value}"></div>
      </div>`;

      const html = `<div id="player-panel-${player.id}-icons" class="icons counters">
        ${icons.map((icon) => templateIcon.replaceAll('{icon-value}', icon)).join(' ')}
        <div class="row"></div>
      </div>`;

      document.getElementById(`player_board_${player.id}`).insertAdjacentHTML('beforeend', html);

      icons.forEach((icon) => {
         const counter = new ebg.counter();
         counter.create(`player-panel-${player.id}-icons-${icon}-counter`);
         counter.setValue(Number(player[icon]));
         this.counters[icon] = counter;
      });

      if (this.player_id == game.gamedatas.first_player_id) {
         this.addFirstTokenPlayer();
      }
   }

   addFirstTokenPlayer() {
      // Remove first token player
      document.querySelectorAll(`.first-player-marker`).forEach((div) => div.remove());

      // Add first token player
      const container = document.querySelectorAll(`#player-panel-${this.player_id}-icons .row`)[0];
      container.insertAdjacentHTML('afterbegin', '<div class="first-player-marker"></div>');
   }
}
