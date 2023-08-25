let diceId = 1;
function getDiceId() {
   return diceId++;
}

class PlayerTable {
   public player_id: number;
   public player_color: string;
   private current_player: boolean;

   public dice: SlotDiceStock;

   constructor(public game: CreatureConforts, player: CreatureConfortsPlayerData) {
      this.player_id = Number(player.id);
      this.current_player = this.player_id == this.game.getPlayerId();

      const colors = {
         dcac28: 'yellow',
         '13586b': 'green',
         '7e797b': 'gray',
         b7313e: 'red',
         '650e41': 'purple',
      };

      this.player_color = colors[player.color];

      const dataset: string = [`data-color="${player.color}"`].join(' ');

      const html = `
         <div id="player-table-${this.player_id}" class="player-table whiteblock player-color-${this.player_color}" style="--player-color: #${player.color}" ${dataset}>
            <div id="player-table-${this.player_id}-name" class="name-wrapper">${player.name}</div>
            <div id="player-table-${this.player_id}-board" class="player-table-board">
               <div id="player-table-${this.player_id}-dice" class="player-table-dice"></div>
            </div>
         </div>`;

      document.getElementById('tables').insertAdjacentHTML('beforeend', html);

      this.dice = new SlotDiceStock(
         game.diceManager,
         document.getElementById(`player-table-${this.player_id}-dice`),
         {
            slotsIds: [1, 2],
            slotClasses: [this.player_color],
            mapDieToSlot: (die) => die.location_arg,
            gap: '16px',
         },
      );

      this.dice.onDieClick = (die: BgaDie6) => {
         const dice = this.dice.getDice();
         dice.forEach((die) => (die.value = Math.floor(Math.random() * 6) + 1));
         this.dice.rollDice(dice, {
            effect: 'rollIn',
            duration: [500, 900],
         });
      };

      this.dice.addDice([
         { id: getDiceId(), type: this.player_color, face: 2, location: this.player_id, location_arg: 1 },
         { id: getDiceId(), type: this.player_color, face: 5, location: this.player_id, location_arg: 2 },
      ]);
   }
}
