class PlayerTable {
   public player_id: number;
   public player_color: string;

   public dice: PlayerDiceStock;
   public hand: Hand<ConfortCard>;
   public cottages: LineStock<CottageCard>;
   public workers: LineStock<Meeple>;

   public comforts: LineStock<ConfortCard>;
   public improvements: LineStock<ImprovementCard>;

   constructor(public game: CreatureComforts, player: CreatureComfortsPlayerData) {
      this.player_id = Number(player.id);
      this.player_color = getColorName(player.color);

      this.setupBoard(game, player);
      this.setupDice(game);
      this.setupHand(game);
      this.setupCottage(game, player);
      this.setupWorker(game, player);
      this.setupConfort(game, player);
      this.setupImprovement(game);
   }

   public hasUmbrella(): boolean {
      return this.improvements.getCards().filter((card) => card.type === '9').length > 0;
   }

   private setupBoard(game: CreatureComforts, player: CreatureComfortsPlayerData) {
      const dataset: string = [`data-color="${player.color}"`].join(' ');

      const resourceManager =
         this.game.getPlayerId() === Number(player.id)
            ? `<div id="player-table-${this.player_id}-resources" class="icons counters"></div>`
            : '';

      const html = `
         <div id="player-table-${this.player_id}" class="player-table player-color-${this.player_color}" style="--player-color: #${player.color}; --player-color-bg: #${player.color}11" ${dataset}>
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
                  <div id="player-table-${this.player_id}-comfort" class="player-table-comfort"></div>
               </div>
            </div>
         </div>`;

      const destination = this.game.getPlayerId() == this.player_id ? 'current-player-table' : 'tables';
      document.getElementById(destination).insertAdjacentHTML('beforeend', html);
   }

   private setupConfort(game: CreatureComforts, player: CreatureComfortsPlayerData) {
      this.comforts = new LineStock<ConfortCard>(
         game.confortManager,
         document.getElementById(`player-table-${this.player_id}-comfort`),
         {
            gap: '7px',
         },
      );
      this.comforts.addCards(game.gamedatas.comforts.players[this.player_id].board);
   }

   private setupCottage(game: CreatureComforts, player: CreatureComfortsPlayerData) {
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

   private setupDice(game: CreatureComforts) {
      this.dice = new PlayerDiceStock(
         game.diceManager,
         document.getElementById(`player-table-${this.player_id}-dice`),
      );

      const dice = game.gamedatas.dice.filter(
         (die) => die.owner_id == this.player_id.toString() && die.location == null,
      );
      this.dice.addDice(dice);
   }

   private setupHand(game: CreatureComforts) {
      this.hand = new Hand<ConfortCard>(
         game.confortManager,
         document.getElementById(`player-table-${this.player_id}-hand`),
         this.player_id === game.getPlayerId(),
         game.getPlayerPanel(this.player_id).counters['card'],
      );

      this.hand.addCards(game.gamedatas.comforts.players[this.player_id].hand);
   }

   private setupImprovement(game: CreatureComforts) {
      this.improvements = new LineStock<ImprovementCard>(
         game.improvementManager,
         document.getElementById(`player-table-${this.player_id}-improvement`),
         {
            gap: '7px',
         },
      );

      this.improvements.addCards(game.gamedatas.improvements.players[this.player_id]);
   }

   private setupWorker(game: CreatureComforts, player: CreatureComfortsPlayerData) {
      const workers = game.gamedatas.workers.player.filter((w) => w.type_arg == player.id);
      this.workers = new LineStock<Meeple>(
         game.workerManager,
         document.getElementById(`player-table-${this.player_id}-worker`),
         { gap: '0' },
      );
      this.workers.addCards(workers);
   }
}
