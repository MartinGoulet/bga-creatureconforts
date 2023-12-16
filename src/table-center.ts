class TableCenter {
   public hidden_confort: ConfortCard = { id: '1000' } as ConfortCard;
   public hidden_traveler: TravelerCard = { id: '1001' } as TravelerCard;
   public hidden_improvement: ImprovementCard = { id: '1002' } as ImprovementCard;

   public confort_market: SlotStock<ConfortCard>;
   public confort_discard: DiscardStock<ConfortCard>;
   public confort_discard_line: LineStock<ConfortCard>;
   public confort_deck: Deck<ConfortCard>;

   public improvement_market: SlotStock<ImprovementCard>;
   public improvement_deck: Deck<ImprovementCard>;
   public improvement_discard: DiscardStock<ImprovementCard>;

   public traveler_deck: Deck<TravelerCard>;
   public valley: SlotStock<ImprovementCard>;

   public worker_locations: LocationStock;
   public dice_locations: DiceLocationStock;

   public hill: VillageDiceStock;
   public glade: LineStock<ImprovementCard>;

   constructor(private game: CreatureComforts) {
      this.setupConfortCards(game);
      this.setupImprovementCards(game);
      this.setupTravelerCards(game);
      this.setupValleyCards(game);
      this.setupWorkerLocations(game);
      this.setupDiceLocations(game);
      this.setupHillDice(game);
      this.setupGlade(game);
      this.setRiverDial(game.gamedatas.river_dial);
      this.setupReservedZones(game);
      this.setupAmericanBeaverZones();
      this.setupBlackBearZones();
      this.setupLeopardFrogZones();

      game.gamedatas.wheelbarrows.forEach((location_id) => this.addWheelbarrow(location_id));
   }

   public addWheelbarrow(location_id: number) {
      const html = `<div class="wheelbarrow"></div>`;
      const zone = document.querySelector(`#reserved-zones [data-zone-id="${location_id}"]`);
      zone.insertAdjacentHTML('beforeend', html);
   }

   public clearWheelbarrow() {
      document
         .querySelectorAll(`#reserved-zones .wheelbarrow`)
         .forEach((div: HTMLDivElement) => div.parentElement.removeChild(div));
   }

   public addRavenToken(location_id: number) {
      const zone = document.querySelector(`#reserved-zones [data-zone-id="${location_id}"]`);
      zone.innerHTML = ResourceHelper.getElement<IconsType>('coin');
   }

   public clearReservedZones() {
      document.querySelectorAll('#reserved-zones .cc-zone').forEach((zone) => {
         zone.childNodes.forEach((item) => item.remove());
      });
   }

   public getDiceFromLocation(location_id: number): Dice[] {
      return this.dice_locations.getDice().filter((die: Dice) => die.location == location_id);
   }

   public getWorkerLocations(): number[] {
      const player_id = this.game.getPlayerId().toString();
      const locations = this.game.tableCenter.worker_locations
         .getCards()
         .filter((meeple) => meeple.type_arg == player_id)
         .map((meeple) => Number(meeple.location_arg));
      if (TravelerHelper.isActivePineMarten()) {
         if (!locations.includes(1)) locations.push(1);
         if (!locations.includes(2)) locations.push(2);
      }
      return locations;
   }

   public setRiverDial(value: number) {
      document.getElementById('river-dial').dataset.position = value.toString();
   }

   public getRiverDial() {
      return Number(document.getElementById('river-dial').dataset.position);
   }

   private setupConfortCards(game: CreatureComforts) {
      const { market, discard, deckCount } = game.gamedatas.comforts;

      this.confort_market = new SlotStock<ConfortCard>(
         game.confortManager,
         document.getElementById(`table-comforts`),
         {
            slotsIds: [1, 2, 3, 4],
            mapCardToSlot: (card) => Number(card.location_arg),
            gap: '12px',
         },
      );

      this.confort_deck = new Deck<ConfortCard>(
         game.confortManager,
         document.getElementById(`deck-comforts`),
         {
            cardNumber: Number(deckCount),
            topCard: this.hidden_confort,
            counter: {},
         },
      );

      this.confort_discard_line = new LineStock<ConfortCard>(
         game.confortManagerDiscard,
         document.getElementById(`discard-comforts-line`),
         {
            gap: '2px',
            center: false,
         },
      );

      this.confort_discard = new DiscardStock<ConfortCard>(
         game.confortManager,
         document.getElementById(`discard-comforts`),
         this.confort_discard_line,
      );

      this.confort_discard.addCards(discard);
      this.confort_market.addCards(market);
   }

   private setupDiceLocations(game: CreatureComforts) {
      this.dice_locations = new DiceLocationStock(
         game.diceManager,
         document.getElementById(`dice-locations`),
      );
      const dice = game.gamedatas.dice.filter((die) => die.location > 0);
      setTimeout(() => {
         // Differ after glade creation
         this.dice_locations.addDice(dice);
      }, 15);
   }

   private setupGlade(game: CreatureComforts) {
      this.glade = new LineStock(this.game.improvementManager, document.getElementById('glade'), {
         sort: sortFunction('location_arg'),
         center: false,
      });

      this.glade.addCards(game.gamedatas.improvements.glade);
   }

   private setupHillDice(game: CreatureComforts) {
      this.hill = new VillageDiceStock(game.diceManager, document.getElementById(`hill-dice`));

      const dice = game.gamedatas.dice.filter((die) => die.location == 0);
      this.hill.addDice(dice);
   }

   private setupImprovementCards(game: CreatureComforts) {
      const { market, discard, deckCount } = game.gamedatas.improvements;
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

      this.improvement_deck = new Deck<ImprovementCard>(
         game.improvementManager,
         document.getElementById(`deck-improvements`),
         {
            cardNumber: Number(deckCount),
            topCard: this.hidden_improvement,
            counter: {},
         },
      );

      this.improvement_discard = new DiscardStock<ImprovementCard>(
         game.improvementManager,
         document.getElementById(`discard-improvements`),
      );

      this.improvement_discard.addCards(discard);
      this.improvement_market.addCards(market);
   }

   setupAmericanBeaverZones() {
      const icons =
         ResourceHelper.getElement<GoodsType>('wood') + ResourceHelper.getElement<GoodsType>('wood');

      const html = arrayRange(1, 2)
         .map((value) => `<div class="cc-zone" data-zone-id="${value}">${icons}</div>`)
         .join('');

      document.getElementById('american-beaver-zones').innerHTML = html;
   }

   setupBlackBearZones() {
      const icon = ResourceHelper.getElement<GoodsType>('fruit');

      const html = arrayRange(1, 4)
         .map((value) => `<div class="cc-zone" data-zone-id="${value}">${icon}</div>`)
         .join('');

      document.getElementById('black-bear-zones').innerHTML = html;
   }

   setupLeopardFrogZones() {
      const icon = ResourceHelper.getElement<IconsType>('lesson');

      document.getElementById(
         'leopard-frog-zones',
      ).innerHTML = `<div class="cc-zone" data-zone-id="9">${icon}${icon}</div>`;
   }

   private setupReservedZones(game: CreatureComforts) {
      document.getElementById('reserved-zones').innerHTML = arrayRange(1, 12)
         .map((value) => `<div class="cc-zone" data-zone-id="${value}"></div>`)
         .join('');

      game.gamedatas.raven_location.forEach((location_id) => this.addRavenToken(location_id));
   }

   private setupTravelerCards(game: CreatureComforts) {
      const { count, topCard } = game.gamedatas.travelers;
      this.traveler_deck = new Deck<TravelerCard>(
         game.travelerManager,
         document.getElementById(`table-travelers`),
         {
            cardNumber: count,
            topCard: topCard ?? this.hidden_traveler,
         },
      );
   }

   private setupValleyCards(game: CreatureComforts) {
      const { forest, meadow } = game.gamedatas.valleys;

      this.valley = new SlotStock<ValleyCard>(game.valleyManager, document.getElementById(`table-valleys`), {
         slotsIds: ['forest', 'meadow'],
         mapCardToSlot: (card) => card.location,
         gap: '30px',
      });

      this.valley.addCards([forest.topCard, meadow.topCard]);
   }

   private setupWorkerLocations(game: CreatureComforts) {
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
