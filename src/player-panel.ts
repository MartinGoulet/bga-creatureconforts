class PlayerPanel {
   public player_id: number;
   public counters: { [icon: string]: ebg.counter } = {};

   constructor(public game: CreatureConforts, player: CreatureConfortsPlayerData) {
      const icons = ['wood', 'stone', 'fruit', 'mushroom', 'yarn', 'grain', 'lesson', 'story', 'coin'];

      const templateIcon = `<div class="wrapper">
      <span id="player-panel-${player.id}-icons-{icon-value}-counter" class="counter">1</span>
         <div class="resource-icon" data-type="{icon-value}"></div>
      </div>`;

      const html = `<div id="player-panel-${player.id}-icons" class="icons counters">
        ${icons.map((icon) => templateIcon.replaceAll('{icon-value}', icon)).join(' ')}
      </div>`;

      document.getElementById(`player_board_${player.id}`).insertAdjacentHTML('beforeend', html);

      icons.forEach((icon) => {
         const counter = new ebg.counter();
         counter.create(`player-panel-${player.id}-icons-${icon}-counter`);
         counter.setValue(Number(player[icon]));
         this.counters[icon] = counter;
      });
   }
}
