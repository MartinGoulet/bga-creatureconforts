// type TakeActionType = "playCardForAbility";

// class ActionManager {
//    private actions: string[] = [];
//    private actions_args: string[] = [];
//    private current_card: Card[];
//    private take_action: TakeActionType;

//    constructor(private game: CreatureConforts) {}

//    public setup(takeAction: TakeActionType = "playCardForAbility", newAction?: string) {
//       debug("actionmanager.reset");

//       this.reset();
//       this.take_action = takeAction;
//       if (newAction) {
//          this.actions.push(newAction);
//       }
//       return this;
//    }

//    public reset() {
//       debug("actionmanager.reset");

//       this.current_card = [];
//       this.take_action = null;
//       this.actions = [];
//       this.actions_args = [];
//       return this;
//    }

//    public addAction(card: Card) {
//       this.current_card.push(card);
//       const card_type = this.game.getCardType(card);
//       debug("actionmanager.addAction", card, card_type);
//       this.addActionPriv(card_type.js_actions);
//       debug("actionmanager.actions values", this.actions);
//       return this;
//    }

//    private addActionPriv(actions?: string[] | string) {
//       if (!actions) {
//          debug("actionmanager.addActionPriv no actions");
//       } else if (Array.isArray(actions)) {
//          actions.forEach((action) => this.actions.push(action));
//       } else if (typeof actions === "string") {
//          this.actions.push(actions);
//       }

//       debug("actionmanager.addActionPriv values", this.actions);
//    }

//    public addArgument(arg: string) {
//       debug("actionmanager.addArgument", arg);
//       this.actions_args.push(arg);
//       return this;
//    }

//    public activateNextAction() {
//       debug("activateNextAction");
//       debug(this.actions_args);
//       if (this.actions.length > 0) {
//          // Invoke action
//          const nextAction = this.actions.shift();
//          this[nextAction]();
//          return;
//       }

//       const card_type = this.game.getCardType(this.current_card[0]);
//       debug("actionmanager.activateNextAction", this.current_card, card_type, this.actions_args);

//       const handleError = (is_error: boolean) => {
//          is_error ? this.game.restoreGameState() : this.game.clearSelection();
//       };

//       const data = {
//          card_id: this.current_card[0].id,
//          args: this.actions_args.join(";"),
//       };

//       this.game.takeAction(this.take_action, data, null, handleError);
//    }

//    public getCurrentCard(): Card {
//       if (this.current_card.length > 0) {
//          return this.current_card[this.current_card.length - 1];
//       } else {
//          return null;
//       }
//    }

//    private getCurrentCardName() {
//       const card = this.getCurrentCard();
//       return this.game.gamedatas.card_types[card.type_arg].name;
//    }

//    public isCardActivated(card: Card) {
//       return this.current_card.filter((c) => c.id == card.id).length > 0;
//    }

//    ////////////////////////////////////////
//    //    _____              _
//    //   / ____|            | |
//    //  | |     __ _ _ __ __| |___
//    //  | |    / _` | '__/ _` / __|
//    //  | |___| (_| | | | (_| \__ \
//    //   \_____\__,_|_|  \__,_|___/
//    ////////////////////////////////////////

// }
