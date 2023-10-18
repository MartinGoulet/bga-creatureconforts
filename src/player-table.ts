class PlayerTable {
   public player_id: number;
   public player_color: string;

   public dice: PlayerDiceStock;
   public hand: Hand<ConfortCard>;
   public cottages: LineStock<CottageCard>;
   public workers: LineStock<Meeple>;

   public conforts: LineStock<ConfortCard>;
   public improvements: LineStock<ImprovementCard>;

   constructor(public game: CreatureConforts, player: CreatureConfortsPlayerData) {
      this.player_id = Number(player.id);
      this.player_color = getColorName(player.color);

      this.setupBoard(game, player);
      this.setupDice(game);
      this.setupHand(game);
      this.setupCottage(game, player);
      this.setupWorker(game, player);
      this.setupConfort(game, player);
      this.setupImprovement(game);
      // if (this.player_id == this.game.getPlayerId()) this.setupResources();
   }

   // public displayResource(resources: { [type: string]: number }[]) {
   //    document.getElementById(`player-table-${this.player_id}-resources`).classList.add('show');
   // }

   // public hideResource() {
   //    document.getElementById(`player-table-${this.player_id}-resources`).classList.remove('show');
   // }

   private setupBoard(game: CreatureConforts, player: CreatureConfortsPlayerData) {
      const dataset: string = [`data-color="${player.color}"`].join(' ');

      const resourceManager =
         this.game.getPlayerId() === Number(player.id)
            ? `<div id="player-table-${this.player_id}-resources" class="icons counters"></div>`
            : '';

      const html = `
         <div id="player-table-${this.player_id}" class="player-table player-color-${this.player_color}" style="--player-color: #${player.color}" ${dataset}>
            <div id="player-table-${this.player_id}-name" class="name-wrapper">${player.name}</div>
            <div class="cols">
               <div class="col">
                  <div id="player-table-${this.player_id}-board" class="player-table-board">
                     <div id="player-table-${this.player_id}-dice" class="player-table-dice"></div>
                     <div id="player-table-${this.player_id}-cottage" class="player-table-cottage"></div>
                     <div id="player-table-${this.player_id}-worker" class="player-table-worker"></div>
                  </div>
                  ${resourceManager}
                  <div id="player-table-${this.player_id}-hand"></div>
               </div>
               <div class="col">
                  <div id="player-table-${this.player_id}-improvement" class="player-table-improvement"></div>
                  <div id="player-table-${this.player_id}-confort" class="player-table-confort"></div>
               </div>
            </div>
         </div>`;

      const destination = this.game.getPlayerId() == this.player_id ? 'current-player-table' : 'tables';
      document.getElementById(destination).insertAdjacentHTML('beforeend', html);
   }

   private setupConfort(game: CreatureConforts, player: CreatureConfortsPlayerData) {
      this.conforts = new LineStock<ConfortCard>(
         game.confortManager,
         document.getElementById(`player-table-${this.player_id}-confort`),
         {
            gap: '10px',
         },
      );
      this.conforts.addCards(game.gamedatas.conforts.players[this.player_id].board);
   }

   private setupCottage(game: CreatureConforts, player: CreatureConfortsPlayerData) {
      this.cottages = new LineStock<CottageCard>(
         game.cottageManager,
         document.getElementById(`player-table-${this.player_id}-cottage`),
         {
            direction: 'column',
            gap: '2px',
         },
      );
      this.cottages.addCards(game.gamedatas.cottages.players[player.id]);
   }

   private setupDice(game: CreatureConforts) {
      this.dice = new PlayerDiceStock(
         game.diceManager,
         document.getElementById(`player-table-${this.player_id}-dice`),
      );

      const dice = game.gamedatas.dice.filter(
         (die) => die.owner_id == this.player_id.toString() && die.location == null,
      );
      this.dice.addDice(dice);
   }

   private setupHand(game: CreatureConforts) {
      this.hand = new Hand<ConfortCard>(
         game.confortManager,
         document.getElementById(`player-table-${this.player_id}-hand`),
         this.player_id === game.getPlayerId(),
         game.getPlayerPanel(this.player_id).counters['card'],
      );

      this.hand.addCards(game.gamedatas.conforts.players[this.player_id].hand);
   }

   private setupImprovement(game: CreatureConforts) {
      this.improvements = new LineStock<ImprovementCard>(
         game.improvementManager,
         document.getElementById(`player-table-${this.player_id}-improvement`),
         {
            gap: '15px',
         },
      );

      this.improvements.addCards(game.gamedatas.improvements.players[this.player_id]);
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
