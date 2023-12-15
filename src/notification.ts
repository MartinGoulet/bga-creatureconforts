class NotificationManager {
   constructor(private game: CreatureComforts) {}

   setup() {
      const notifs: [string, number?][] = [
         ['onDiscardStartHand'],
         ['onNewTraveler', 1000],
         ['onFamilyDice', undefined],
         ['onRevealPlacement', 1000],
         ['onVillageDice', 1200],
         ['onMoveDiceToHill', 1000],
         ['onMoveDiceToLocation', 1000],
         ['onReturnWorkerToPlayerBoard'],
         ['onGetResourcesFromLocation', 1200],
         ['onCraftConfort', 1000],
         ['onReturnDice', 1200],
         ['onReturnFamilyDie', undefined],
         ['onNewSeason', 1000],
         ['onRiverDialRotate', 500],
         ['onRefillOwlNest', undefined],
         ['onRefillLadder', undefined],
         ['onDiscardTraveler', 100],
         ['onNewFirstPlayer', 100],
         ['onTravelerExchangeResources', 100],
         ['onMarketExchangeResources', 100],
         ['onDrawConfort', undefined],
         ['onAddConfortToHand', undefined],
         ['onBuildImprovement', undefined],
         ['onModifyDieWithLessonLearned', 100],
         ['onModifyDieWithWildTurkey', 375],
         ['onNewRavenLocationTaken', 100],
         ['onAddAlmanac', 100],
         ['onAddWheelbarrow', 100],
         ['onNewTurn', 100],
         ['onFinalScoring', 3000],
      ];

      this.setupNotifications(notifs);

      ['message', 'onDrawConfort'].forEach((eventName) => {
         this.game.notifqueue.setIgnoreNotificationCheck(
            eventName,
            (notif) => notif.args.excluded_player_id && notif.args.excluded_player_id == this.game.player_id,
         );
      });
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
      deck.setCardNumber(count + 1, { id: card.id } as TravelerCard);
      setTimeout(() => {
         deck.flipCard(card);
         TravelerHelper.setTravelerToTable();
      }, 500);
   }

   private async notif_onFamilyDice(args: FamilyDiceArgs) {
      const stack = this.game.getPlayerTable(Number(args.player_id)).dice;
      stack.removeAll();
      await stack.addDice(args.dice);
      stack.rollDice(args.dice, { duration: [500, 900], effect: 'rollIn' });
      await new Promise((resolve) => setTimeout(() => resolve(true), 1000));
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
      this.game.tableCenter.hill.removeDice(dice);
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
      const fromElement =
         location_id < 20
            ? document.querySelector(`#worker-locations *[data-slot-id="${location_id}"]`)
            : document.querySelector(`#dice-locations   *[data-slot-id="${location_id}"]`);
      this.animationMoveResource(player_id, resources, fromElement);
   }

   private notif_onCraftConfort({ player_id, card, cost }: CraftConfortArgs) {
      const counters = this.game.getPlayerPanel(player_id).counters;
      const comforts = this.game.getPlayerTable(player_id).comforts;

      comforts.addCard(card);
      Object.keys(cost).forEach((type) => {
         const value = -cost[type];
         counters[type].incValue(value);
      });
   }

   private notif_onReturnDice({ player_id, dice }: { player_id: number; dice: Dice[] }) {
      const white_dice = dice.filter((die) => die.type == 'white');
      const player_dice = dice.filter((die) => Number(die.owner_id) == player_id);
      this.game.tableCenter.hill.removeDice(white_dice);
      this.game.tableCenter.hill.addDice(white_dice);
      this.game.getPlayerTable(player_id).dice.removeDice(player_dice);
      this.game.getPlayerTable(player_id).dice.addDice(player_dice);
   }

   private notif_onReturnFamilyDie({ player_id, die }: { player_id: number; die: Dice }) {
      return this.game.getPlayerTable(player_id).dice.addDie(die);
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
      const { confort_deck: deck, confort_market: market } = this.game.tableCenter;

      for (const card of owl_nest.slice(0, 3)) {
         await market.swapCards([{ ...card }]);
      }
      await market.addCard(owl_nest[3], { fromStock: deck });
   }

   private async notif_onRefillLadder({
      ladder,
      discard,
      shuffled,
      cards,
   }: {
      ladder: ImprovementCard[];
      discard?: ConfortCard;
      shuffled: boolean;
      cards: ImprovementCard[];
   }) {
      if (discard) {
         await this.game.tableCenter.improvement_discard.addCard(discard);
      }
      const { improvement_deck: deck, improvement_market: market } = this.game.tableCenter;
      market.setSelectionMode('none');

      for (const card of ladder.slice(0, 5)) {
         await market.swapCards([{ ...card }]);
      }

      if (shuffled) {
         let copy = [...cards, { id: ladder[5].id } as ImprovementCard];
         await deck.addCards(copy);
         await deck.shuffle(Math.min(copy.length, 8));
         deck.setCardNumber(deck.getCardNumber(), this.game.tableCenter.hidden_improvement);
      }
      await market.addCard(ladder[5], { fromStock: deck });
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

      const fromElement = document.querySelectorAll(`#worker-locations *[data-slot-id="9"]`)[0];
      this.animationMoveResource(player_id, to, fromElement);
   }

   private notif_onMarketExchangeResources({ from, to, player_id }: MarketExchangeResourcesArgs) {
      const { counters } = this.game.getPlayerPanel(player_id);
      Object.keys(from).forEach((type) => counters[type].incValue(-from[type]));

      const fromElement = document.querySelectorAll(`#worker-locations *[data-slot-id="8"]`)[0];
      this.animationMoveResource(player_id, to, fromElement);
   }

   private async notif_onDrawConfort({ player_id, card }: { player_id: number; card: ConfortCard }) {
      const { confort_deck: deck, hidden_confort } = this.game.tableCenter;
      deck.setCardNumber(deck.getCardNumber(), { ...card });
      await this.game.getPlayerTable(player_id).hand.addCard(card);
      deck.setCardNumber(deck.getCardNumber(), { ...hidden_confort });
   }

   private async notif_onAddConfortToHand({ player_id, card }: { player_id: number; card: ConfortCard }) {
      if (player_id !== this.game.getPlayerId()) {
         card = { id: card.id } as ConfortCard;
      }
      await this.game.getPlayerTable(player_id).hand.addCard(card);
   }

   private async notif_onBuildImprovement({ player_id, card, cost, cottage }: BuildImprovementArgs) {
      if (card.location == 'board') {
         await this.game.getPlayerTable(player_id).improvements.addCard(card);
      } else {
         await this.game.tableCenter.glade.addCard(card);
      }

      await this.game.improvementManager.addCottage(card, cottage);

      const counters = this.game.getPlayerPanel(player_id).counters;

      Object.keys(cost).forEach((type) => {
         const value = -cost[type];
         counters[type].incValue(value);
      });
   }

   private notif_onModifyDieWithLessonLearned({
      player_id,
      nbr_lesson,
      die_id,
      die_newvalue,
   }: ModifyDieWithLessonLearnedArgs) {
      this.game.getPlayerPanel(player_id).counters['lesson'].incValue(-nbr_lesson);
      const die = this.game.tableCenter.dice_locations.getDice().find((d) => d.id == die_id);
      die.face = die_newvalue;
      this.game.getPlayerTable(player_id).dice.rollDie(die, { effect: 'turn', duration: 375 });
   }

   private notif_onModifyDieWithWildTurkey({ player_id, die_val_id, die_val_to }: ModifyDieWithWildTurkey) {
      const die = this.game
         .getPlayerTable(player_id)
         .dice.getDice()
         .find((d) => d.id == die_val_id);

      die.face = die_val_to;
      this.game.getPlayerTable(player_id).dice.rollDie(die, { effect: 'turn', duration: 375 });
   }

   private notif_onNewRavenLocationTaken({ location_id }: { location_id: number }) {
      this.game.tableCenter.addRavenToken(location_id);
   }

   private notif_onAddAlmanac({ player_id }: { player_id: number }) {
      this.game.getPlayerPanel(player_id).addAlmanac();
   }

   private notif_onAddWheelbarrow({ player_id }: { player_id: number }) {
      this.game.getPlayerPanel(player_id).addWheelbarrow();
   }

   private notif_onNewTurn({ turn_number }: { turn_number: number }) {
      this.game.gameOptions.setTurnNumber(turn_number);
   }

   private notif_onFinalScoring({ scores }: { scores: Record<number, any> }) {
      this.game.tableScore.displayScores(scores);
      Object.keys(scores).forEach((player_id) => {
         this.game.scoreCtrl[player_id].toValue(scores[player_id]['total']);
      });
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

         Object.getOwnPropertyNames(CreatureComforts.prototype)
            .filter((item) => item.startsWith('notif_'))
            .map((item) => item.slice(6))
            .forEach((item) => {
               if (!notifs.some((notif) => notif[0] == item)) {
                  console.warn(`notif_${item} function is declared, but not listed in setupNotifications`);
               }
            });
      }
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

interface MarketExchangeResourcesArgs {
   player_id: number;
   from: { [type: string]: number }[];
   to: { [type: string]: number }[];
}

interface BuildImprovementArgs {
   player_id: number;
   card: ImprovementCard;
   cottage: CottageCard;
   cost: { [type: string]: number }[];
}

interface ModifyDieWithLessonLearnedArgs {
   player_id: number;
   nbr_lesson: number;
   die_id: number;
   die_newvalue: number;
}

interface ModifyDieWithWildTurkey {
   player_id: number;
   die_val_id: number;
   die_val_to: number;
}
