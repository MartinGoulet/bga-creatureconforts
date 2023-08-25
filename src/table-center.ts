class TableCenter {
   public conforts: SlotStock<Card>;
   public improvements: SlotStock<Improvement>;
   public travelers: Deck<Traveler>;
   public valley: SlotStock<Improvement>;

   public discardConfort: HiddenDeck<Confort>;
   public deckConfort: VisibleDeck<Confort>;

   constructor(private game: CreatureConforts) {
      this.setupConforts(game);
      this.setupImprovements(game);
      this.setupTravelers(game);
      this.setupValleys(game);
      this.setupConfortsDiscard(game);
      this.setupConfortsDeck(game);
   }

   private setupConforts(game: CreatureConforts) {
      this.conforts = new SlotStock<Confort>(game.confortManager, document.getElementById(`table-conforts`), {
         slotsIds: [1, 2, 3, 4],
         mapCardToSlot: (card) => Number(card.location_arg),
         gap: '12px',
      });

      this.conforts.addCards(game.gamedatas.conforts);
   }

   private setupImprovements(game: CreatureConforts) {
      this.improvements = new SlotStock<Improvement>(
         game.improvementManager,
         document.getElementById(`table-improvements`),
         {
            slotsIds: [6, 5, 4, 3, 2, 1],
            mapCardToSlot: (card) => Number(card.location_arg),
            direction: 'column',
            gap: '7px',
         },
      );
      this.improvements.addCards(game.gamedatas.improvements);
   }

   private setupTravelers(game: CreatureConforts) {
      this.travelers = new Deck<Traveler>(
         game.travelerManager,
         document.getElementById(`table-travelers`),
         {},
      );
      this.travelers.addCards(game.gamedatas.travelers);
   }

   private setupValleys(game: CreatureConforts) {
      this.valley = new SlotStock<Valley>(game.valleyManager, document.getElementById(`table-valleys`), {
         slotsIds: ['forest', 'meadow'],
         mapCardToSlot: (card) => card.location,
         gap: '30px',
      });
      this.valley.addCards(game.gamedatas.valleys);
   }

   private setupConfortsDeck(game: CreatureConforts) {
      this.deckConfort = new VisibleDeck<Confort>(
         game.confortManager,
         document.getElementById(`deck-conforts`),
      );
      this.deckConfort.addCards(game.gamedatas.confortsDeck);
   }

   private setupConfortsDiscard(game: CreatureConforts) {
      this.discardConfort = new HiddenDeck<Confort>(
         game.confortManager,
         document.getElementById(`discard-conforts`),
      );
      this.discardConfort.addCards(game.gamedatas.confortsDiscard);
   }
}
