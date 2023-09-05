interface CreatureConfortsPlayerData extends BgaPlayer {
   // Add Player data
   coin: string;
   fruit: string;
   grain: string;
   lesson: string;
   mushroom: string;
   stone: string;
   wood: string;
   yarn: string;
}

type PlayerBoardObject = { [player_id: number]: PlayerBoardInfo };

interface CreatureConfortsGamedatas extends BgaGamedatas<CreatureConfortsPlayerData> {
   improvement_types: { [card_type: number]: ImprovementType };
   confort_types: { [card_type: number]: ConfortType };
   valley_types: { [card_type: number]: ValleyType };

   dice: Dice[];
   conforts: ConfortUIData;
   improvements: ImprovementUIData;
   travelers: TravelerUIData;
   valleys: ValleyUIData;
   workers: WorkerUIData;

   player_board: PlayerBoardObject;

   first_player_id: number;
   river_dial: number;
}

type TopCardCount<T> = {
   topCard: T;
   count: number;
};

interface ConfortUIData {
   discard: {
      topCard?: ConfortCard;
      count: number;
   };
   deckCount: number;
   market: ConfortCard[];
   players: { [player_id: number]: ConfortUIDataPlayer };
}

interface ConfortUIDataPlayer {
   hand: ConfortCard[];
   board: ConfortCard[];
}
interface ImprovementUIData {
   market: ImprovementCard[];
}
interface TravelerUIData {
   topCard?: TravelerCard;
   count: number;
}
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

interface Cottage {
   player_id: number;
   token_id: number;
   location: number;
}

interface ImprovementType {
   name: string;
   score: number;
   cost: { [type: string]: number };
   power: string;
}

interface ConfortType {
   name: string;
   type?: 'outdoor' | 'food' | 'clothing' | 'lighting';
   score: number;
   cost: { [type: string]: number };
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
   resources: string[];
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
