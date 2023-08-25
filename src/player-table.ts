class PlayerTable {
   public player_id: number;
   public player_color: string;

   public dice: SlotDiceStock;
   public hand: HandStock<Confort>;

   constructor(public game: CreatureConforts, player: CreatureConfortsPlayerData) {
      this.player_id = Number(player.id);
      this.player_color = getColorName(player.color);

      this.setupBoard(game, player);
      this.setupDice(game);
      this.setupHand(game);
   }

   private setupBoard(game: CreatureConforts, player: CreatureConfortsPlayerData) {
      const dataset: string = [`data-color="${player.color}"`].join(' ');

      const html = `
         <div id="player-table-${this.player_id}" class="player-table whiteblock player-color-${this.player_color}" style="--player-color: #${player.color}" ${dataset}>
            <div id="player-table-${this.player_id}-name" class="name-wrapper">${player.name}</div>
            <div id="player-table-${this.player_id}-board" class="player-table-board">
               <div id="player-table-${this.player_id}-dice" class="player-table-dice"></div>
            </div>
            <div id="player-table-${this.player_id}-hand"></div>
         </div>`;

      document.getElementById('tables').insertAdjacentHTML('beforeend', html);
   }

   private setupDice(game: CreatureConforts) {
      this.dice = new SlotDiceStock(
         game.diceManager,
         document.getElementById(`player-table-${this.player_id}-dice`),
         {
            slotsIds: [1, 2],
            slotClasses: [this.player_color],
            mapDieToSlot: (die) => die.location_arg,
            gap: '10px',
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
   }

   private setupHand(game: CreatureConforts) {
      this.hand = new HandStock<Confort>(
         game.confortManager,
         document.getElementById(`player-table-${this.player_id}-hand`),
         {
            cardOverlap: '10px',
            cardShift: '5px',
            inclination: 6,
            sort: sortFunction('id'),
         },
      );

      this.hand.addCards(game.gamedatas.hands[this.player_id]);
   }
}
