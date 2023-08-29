class PlayerTable {
   public player_id: number;
   public player_color: string;

   public dice: LineDiceStock;
   public hand: HandStock<ConfortCard>;
   public cottages: LineStock<Cottage>;
   public workers: LineStock<Meeple>;

   constructor(public game: CreatureConforts, player: CreatureConfortsPlayerData) {
      this.player_id = Number(player.id);
      this.player_color = getColorName(player.color);

      this.setupBoard(game, player);
      this.setupDice(game);
      this.setupHand(game);
      this.setupCottage(game, player);
      this.setupWorker(game, player);
   }

   private setupBoard(game: CreatureConforts, player: CreatureConfortsPlayerData) {
      const dataset: string = [`data-color="${player.color}"`].join(' ');

      const html = `
         <div id="player-table-${this.player_id}" class="player-table whiteblock player-color-${this.player_color}" style="--player-color: #${player.color}" ${dataset}>
            <div id="player-table-${this.player_id}-name" class="name-wrapper">${player.name}</div>
            <div id="player-table-${this.player_id}-board" class="player-table-board">
               <div id="player-table-${this.player_id}-dice" class="player-table-dice"></div>
               <div id="player-table-${this.player_id}-cottage" class="player-table-cottage"></div>
               <div id="player-table-${this.player_id}-worker" class="player-table-worker"></div>
            </div>
            <div id="player-table-${this.player_id}-hand"></div>
         </div>`;

      document.getElementById('tables').insertAdjacentHTML('beforeend', html);
   }

   private setupCottage(game: CreatureConforts, player: CreatureConfortsPlayerData) {
      this.cottages = new LineStock<Cottage>(
         game.cottageManager,
         document.getElementById(`player-table-${this.player_id}-cottage`),
         {
            direction: 'column',
            gap: '2px',
         },
      );
      this.cottages.addCards([
         { token_id: 1, player_id: Number(player.id), location: 0 } as Cottage,
         { token_id: 2, player_id: Number(player.id), location: 0 } as Cottage,
         { token_id: 3, player_id: Number(player.id), location: 0 } as Cottage,
         { token_id: 4, player_id: Number(player.id), location: 0 } as Cottage,
      ]);
   }

   private setupDice(game: CreatureConforts) {
      this.dice = new LineDiceStock(
         game.diceManager,
         document.getElementById(`player-table-${this.player_id}-dice`),
         {
            gap: '10px',
         },
      );

      const dice = game.gamedatas.dice.filter(
         (die) => die.owner_id == this.player_id.toString() && die.location == null,
      );
      this.dice.addDice(dice);
   }

   private setupHand(game: CreatureConforts) {
      this.hand = new HandStock<ConfortCard>(
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

   private setupWorker(game: CreatureConforts, player: CreatureConfortsPlayerData) {
      const workers = game.gamedatas.workers.player.filter((w) => w.type_arg == player.id);
      this.workers = new LineStock<Meeple>(
         game.workerManager,
         document.getElementById(`player-table-${this.player_id}-worker`),
         { gap: '0' },
      );
      this.workers.addCards(workers);
   }
}
