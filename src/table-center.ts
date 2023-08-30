class TableCenter {
   public hidden_confort: ConfortCard = { id: '1000' } as ConfortCard;
   public hidden_traveler: TravelerCard = { id: '1001' } as TravelerCard;

   public confort_market: SlotStock<ConfortCard>;
   public confort_discard: Deck<ConfortCard>;
   public confort_deck: Deck<ConfortCard>;

   public improvement_market: SlotStock<ImprovementCard>;

   public traveler_deck: Deck<TravelerCard>;
   public valley: SlotStock<ImprovementCard>;

   public worker_locations: LocationStock;

   public hill: LineDiceStock;

   constructor(private game: CreatureConforts) {
      this.setupConfortCards(game);
      this.setupImprovementCards(game);
      this.setupTravelerCards(game);
      this.setupValleyCards(game);
      this.setupWorkerLocations(game);
      this.setupHillDice(game);
   }

   private setupConfortCards(game: CreatureConforts) {
      const { market, discard, deckCount } = game.gamedatas.conforts;

      this.confort_market = new SlotStock<ConfortCard>(
         game.confortManager,
         document.getElementById(`table-conforts`),
         {
            slotsIds: [1, 2, 3, 4],
            mapCardToSlot: (card) => Number(card.location_arg),
            gap: '12px',
         },
      );

      this.confort_deck = new Deck<ConfortCard>(
         game.confortManager,
         document.getElementById(`deck-conforts`),
         {
            cardNumber: deckCount,
            topCard: this.hidden_confort,
            counter: {},
         },
      );

      this.confort_discard = new Deck<ConfortCard>(
         game.confortManager,
         document.getElementById(`discard-conforts`),
         {
            cardNumber: discard.count,
            topCard: discard.topCard,
            counter: {},
         },
      );

      this.confort_market.addCards(market);
   }

   private setupHillDice(game: CreatureConforts) {
      this.hill = new LineDiceStock(game.diceManager, document.getElementById(`hill-dice`), {
         gap: '5px',
         sort: sortFunction('id'),
      });

      const dice = game.gamedatas.dice.filter((die) => die.type == 'white' && die.location == null);
      this.hill.addDice(dice);
   }

   private setupImprovementCards(game: CreatureConforts) {
      const { market } = game.gamedatas.improvements;
      this.improvement_market = new SlotStock<ImprovementCard>(
         game.improvementManager,
         document.getElementById(`table-improvements`),
         {
            slotsIds: [6, 5, 4, 3, 2, 1],
            mapCardToSlot: (card) => Number(card.location_arg),
            direction: 'column',
            gap: '7px',
         },
      );
      this.improvement_market.addCards(market);
   }

   private setupTravelerCards(game: CreatureConforts) {
      const { count, topCard } = game.gamedatas.travelers;
      this.traveler_deck = new Deck<TravelerCard>(
         game.travelerManager,
         document.getElementById(`table-travelers`),
         {
            cardNumber: count,
            topCard: topCard ?? this.hidden_traveler,
            counter: {},
         },
      );
   }

   private setupValleyCards(game: CreatureConforts) {
      const { forest, meadow } = game.gamedatas.valleys;

      this.valley = new SlotStock<ValleyCard>(game.valleyManager, document.getElementById(`table-valleys`), {
         slotsIds: ['forest', 'meadow'],
         mapCardToSlot: (card) => card.location,
         gap: '30px',
      });

      this.valley.addCards([forest.topCard, meadow.topCard]);
   }

   private setupWorkerLocations(game: CreatureConforts) {
      this.worker_locations = new LocationStock(
         game.workerManager,
         document.getElementById(`worker-locations`),
         {
            slotsIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            mapCardToSlot: (meeple) => meeple.location_arg,
            gap: '0',
         },
      );
      this.worker_locations.addCards(game.gamedatas.workers.board);
   }
}
