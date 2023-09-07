class NotificationManager {
   constructor(private game: CreatureConforts) {}

   setup() {
      const notifs: [string, number?][] = [
         ['onDiscardStartHand'],
         ['onNewTraveler', 1000],
         ['onFamilyDice', 1000],
         ['onRevealPlacement', 1000],
         ['onVillageDice', 1200],
         ['onMoveDiceToHill', 1000],
         ['onMoveDiceToLocation', 1000],
         ['onReturnWorkerToPlayerBoard'],
         ['onGetResourcesFromLocation', 1200],
         ['onCraftConfort', 1000],
         ['onReturnDice', 1200],
         ['onNewSeason', 1000],
         ['onRiverDialRotate', 500],
         ['onRefillOwlNest'],
         ['onDiscardTraveler', 100],
         ['onNewFirstPlayer', 100],
         ['onTravelerExchangeResources', 100],
      ];

      this.setupNotifications(notifs);
   }

   private async notif_onDiscardStartHand(args: DiscardStartHandArgs) {
      await this.game.tableCenter.confort_discard.addCard(args.card);
   }

   private notif_onNewTraveler(args: NewTravelerArgs) {
      const { card, count } = args;
      const { traveler_deck: deck, hidden_traveler } = this.game.tableCenter;
      if (count < 15) {
         deck.removeCard(deck.getTopCard());
      }
      deck.setCardNumber(count, { id: card.id } as TravelerCard);
      setTimeout(() => deck.flipCard(card), 500);
   }

   private notif_onFamilyDice(args: FamilyDiceArgs) {
      this.game.gamedatas.playerorder.forEach(async (player_id) => {
         const dice = args.dice.filter((die) => die.owner_id == player_id.toString());
         const stack = this.game.getPlayerTable(Number(player_id)).dice;
         stack.removeAll();
         await stack.addDice(dice);
         stack.rollDice(dice, { duration: [500, 900], effect: 'rollIn' });
      });
   }

   private notif_onRevealPlacement({ workers }: { workers: WorkerUIData }) {
      this.game.tableCenter.worker_locations.addCards(workers.board);
      // TODO add improvement
   }

   private notif_onVillageDice({ dice }: { dice: Dice[] }) {
      const white_dice = dice.filter((die) => die.type == 'white');
      const stack = this.game.tableCenter.hill;
      stack.addDice(white_dice);
      stack.rollDice(dice, { effect: 'rollIn', duration: [500, 900] });
   }

   private notif_onMoveDiceToHill({ dice }: { dice: Dice[] }) {
      this.game.tableCenter.hill.addDice(dice);
   }

   private notif_onMoveDiceToLocation({ dice }: { dice: Dice[] }) {
      this.game.tableCenter.dice_locations.addDice(dice);
   }

   private async notif_onReturnWorkerToPlayerBoard(args: { player_id: number; worker: Meeple }) {
      await this.game.getPlayerTable(args.player_id).workers.addCard(args.worker);
   }

   private notif_onGetResourcesFromLocation({
      location_id,
      resources,
      player_id,
   }: GetResourcesFromLocationArgs) {
      // let index = 0;
      // Object.keys(resources).forEach((type) => {
      //    const count = resources[type];
      //    for (let i = 0; i < count; i++) {
      //       this.game.slideTemporaryObject(
      //          `<div class="resource-icon" data-type="${type}"></div>`,
      //          'overall-content', //'left-side-wrapper',
      //          document.querySelectorAll(`#worker-locations *[data-slot-id="${location_id}"`)[0],
      //          `player-panel-${player_id}-icons-${type}-counter`,
      //          1000,
      //          250 * index++,
      //       );
      //    }
      //    this.game.getPlayerPanel(player_id).counters[type].incValue(count);
      // });
      this.animationMoveResource(
         player_id,
         resources,
         document.querySelectorAll(`#worker-locations *[data-slot-id="${location_id}"]`)[0],
      );
   }

   private notif_onCraftConfort({ player_id, card, cost }: CraftConfortArgs) {
      const counters = this.game.getPlayerPanel(player_id).counters;
      const conforts = this.game.getPlayerTable(player_id).conforts;

      conforts.addCard(card);
      Object.keys(cost).forEach((type) => {
         const value = -cost[type];
         counters[type].incValue(value);
      });
   }

   private notif_onReturnDice({ player_id, dice }: { player_id: number; dice: Dice[] }) {
      const white_dice = dice.filter((die) => die.type == 'white');
      const player_dice = dice.filter((die) => Number(die.owner_id) == player_id);
      this.game.tableCenter.hill.addDice(white_dice);
      this.game.getPlayerTable(player_id).dice.addDice(player_dice);
   }

   private notif_onNewSeason(args: { info: ValleyUIData }) {
      const { forest, meadow } = args.info;
      this.game.tableCenter.valley.removeAll();
      this.game.tableCenter.valley.addCards([forest.topCard, meadow.topCard]);
   }

   private notif_onRiverDialRotate({ value }: { value: number }) {
      this.game.tableCenter.setRiverDial(value);
   }

   private async notif_onRefillOwlNest(args: { owl_nest: ConfortCard[]; discard?: ConfortCard }) {
      const { owl_nest, discard } = args;
      if (discard) {
         await this.game.tableCenter.confort_discard.addCard(discard);
      }
      const { confort_deck: deck, confort_market: market, hidden_confort } = this.game.tableCenter;

      await market.swapCards(owl_nest.slice(0, 3));
      await market.addCard(owl_nest[3], { fromStock: deck });
      // deck.setCardNumber(deck.getCardNumber(), { ...hidden_confort });
   }

   private notif_onRefillLadder(args: { ladder: ConfortCard[]; discard?: ConfortCard }) {
      const { ladder, discard } = args;
      if (discard) {
         this.game.tableCenter.confort_discard.addCard(discard);
      }
      const { improvement_deck: deck, confort_market: market, hidden_improvement } = this.game.tableCenter;
      deck.setCardNumber(deck.getCardNumber(), { id: ladder[5].id } as ImprovementCard);
      market.addCards(ladder);
      deck.setCardNumber(deck.getCardNumber(), { ...hidden_improvement });
   }

   private notif_onDiscardTraveler(args: any) {
      const { traveler_deck: deck, hidden_traveler } = this.game.tableCenter;
      deck.setCardNumber(deck.getCardNumber() - 1, { ...hidden_traveler });
   }

   private notif_onNewFirstPlayer({ player_id }: { player_id: number }) {
      this.game.getPlayerPanel(player_id).addFirstTokenPlayer();
   }

   private notif_onTravelerExchangeResources({ from, to, player_id }: TravelerExchangeResourcesArgs) {
      const { counters } = this.game.getPlayerPanel(player_id);
      Object.keys(from).forEach((type) => counters[type].incValue(-from[type]));
      this.animationMoveResource(
         player_id,
         to,
         document.querySelectorAll(`#worker-locations *[data-slot-id="9"]`)[0],
      );
   }

   private animationMoveResource(
      player_id: number,
      resources: { [type: string]: number }[],
      fromElement: Element,
   ) {
      let index = 0;
      Object.keys(resources).forEach((type) => {
         const count = resources[type];
         for (let i = 0; i < count; i++) {
            this.game.slideTemporaryObject(
               `<div class="resource-icon" data-type="${type}"></div>`,
               'overall-content', //'left-side-wrapper',
               fromElement,
               `player-panel-${player_id}-icons-${type}-counter`,
               1000,
               250 * index++,
            );
         }
         this.game.getPlayerPanel(player_id).counters[type].incValue(count);
      });
   }

   private setupNotifications(notifs: any) {
      notifs.forEach(([eventName, duration]) => {
         dojo.subscribe(eventName, this, (notifDetails: INotification<any>) => {
            debug(`notif_${eventName}`, notifDetails.args);

            const promise = this[`notif_${eventName}`](notifDetails.args);

            // tell the UI notification ends, if the function returned a promise
            promise?.then(() => this.game.notifqueue.onSynchronousNotificationEnd());
         });
         this.game.notifqueue.setSynchronous(eventName, duration);
      });

      if (isDebug) {
         notifs.forEach((notif) => {
            if (!this[`notif_${notif[0]}`]) {
               console.warn(`notif_${notif[0]} function is not declared, but listed in setupNotifications`);
            }
         });

         Object.getOwnPropertyNames(CreatureConforts.prototype)
            .filter((item) => item.startsWith('notif_'))
            .map((item) => item.slice(6))
            .forEach((item) => {
               if (!notifs.some((notif) => notif[0] == item)) {
                  console.warn(`notif_${item} function is declared, but not listed in setupNotifications`);
               }
            });
      }

      this.game.notifqueue.setIgnoreNotificationCheck(
         'message',
         (notif) => notif.args.excluded_player_id && notif.args.excluded_player_id == this.game.player_id,
      );
   }
}

interface DiscardStartHandArgs {
   player_id: number;
   card: ConfortCard;
}

interface NewTravelerArgs {
   card: TravelerCard;
   count: number;
}

interface FamilyDiceArgs {
   player_id: number;
   rolledDice: number[];
   dice: Dice[];
}

interface GetResourcesFromLocationArgs {
   player_id: number;
   location_id: number;
   resources: { [type: string]: number }[];
}

interface CraftConfortArgs {
   player_id: number;
   card: ConfortCard;
   cost: { [type: string]: number }[];
}

interface TravelerExchangeResourcesArgs {
   player_id: number;
   from: { [type: string]: number }[];
   to: { [type: string]: number }[];
}
