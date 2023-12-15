interface CreatureComfortsPlayerData extends BgaPlayer {
   // Add Player data
   coin: string;
   fruit: string;
   grain: string;
   lesson: string;
   mushroom: string;
   stone: string;
   wood: string;
   yarn: string;
   almanac: string;
   wheelbarrow: string;
}

type PlayerBoardObject = { [player_id: number]: PlayerBoardInfo };

interface CreatureComfortsGamedatas extends BgaGamedatas<CreatureComfortsPlayerData> {
   improvement_types: { [card_type: number]: ImprovementType };
   confort_types: { [card_type: number]: ConfortType };
   valley_types: { [card_type: number]: ValleyType };

   dice: Dice[];
   comforts: ConfortUIData;
   cottages: CottageUIData;
   improvements: ImprovementUIData;
   travelers: TravelerUIData;
   valleys: ValleyUIData;
   workers: WorkerUIData;

   player_board: PlayerBoardObject;

   first_player_id: number;
   river_dial: number;
   raven_location: number[];

   turn_number: number;
   nbr_turns: number;
   wheelbarrows: number[];

   scores: Record<number, any>;
}

type TopCardCount<T> = {
   topCard: T;
   count: number;
};

interface ConfortUIData {
   discard: ConfortCard[];
   deckCount: number;
   market: ConfortCard[];
   players: { [player_id: number]: ConfortUIDataPlayer };
}

interface ConfortUIDataPlayer {
   hand: ConfortCard[];
   board: ConfortCard[];
}

interface CottageUIData {
   improvements: CottageCard[];
   players: { [player_id: number]: CottageCard[] };
}

interface ImprovementUIData {
   discard: ImprovementCard[];
   deckCount: number;
   market: ImprovementCard[];
   glade: ImprovementCard[];
   players: { [player_id: number]: ImprovementCard[] };
}
interface TravelerUIData {
   topCard?: TravelerCard;
   count: number;
   types: { [type: number]: TravelerType };
}

interface TravelerType {
   name: string;
   timing: string;
   gametext: string;
   img: number;
   // reward: TravelerReward[];
   trade: ResourceManagerPayForSettings<IconsType>;
}
// interface TravelerReward {
//    from?: string[];
//    to: string[];
//    times: number;
// }

interface ValleyUIData {
   forest: TopCardCount<ValleyCard>;
   meadow: TopCardCount<ValleyCard>;
}
interface WorkerUIData {
   player: Meeple[];
   board: Meeple[];
   improuvement: Meeple[];
}

interface PlayerBoardInfo {}

interface ConfortCard extends Card {}
interface ImprovementCard extends Card {}
interface TravelerCard extends Card {}
interface ValleyCard extends Card {}
interface CottageCard extends Card {}

interface ImprovementType {
   name: string;
   score: number;
   img: number;
   cost: { [type: string]: number };
   gametext: string;
}

interface ConfortType {
   name: string;
   gametext: string;
   type?: 'outdoor' | 'food' | 'clothing' | 'lighting';
   score: number;
   img: number | number[];
   cost: Record<string, number>;
   storable?: IconsType[];
}

interface ValleyType {
   id: string;
   name: string;
   season: string;
   image_pos: number;
   position: {
      1: ValleyLocationInfo;
      2: ValleyLocationInfo;
      3: ValleyLocationInfo;
      4: ValleyLocationInfo;
   };
}

interface ValleyLocationInfo {
   count: number;
   rule: string;
   values: number[];
   resources: Record<IconsType, number>;
}

interface Dice extends BgaDie {
   owner_id?: string;
   location?: number;
}

interface Meeple extends Card {}

/////////////////////////////////////////////
// States
interface StateHandler {
   onEnteringState(args: any): void;
   onLeavingState(): void;
   onUpdateActionButtons(args: any): void;
   // restoreGameState(): Promise<boolean>;
}

/**
 * Notifications
 */
