interface CreatureConfortsPlayerData extends BgaPlayer {
   // Add Player data
}

type PlayerBoardObject = { [player_id: number]: PlayerBoardInfo };

interface CreatureConfortsGamedatas extends BgaGamedatas<CreatureConfortsPlayerData> {
   improvement_types: { [card_type: number]: ImprovementType };
   card_types: { [card_type: number]: ImprovementType };

   conforts: Confort[];
   improvements: Improvement[];
   travelers: Traveler[];
   valleys: Valley[];

   player_board: PlayerBoardObject;
   players_order: number[];
}

interface PlayerBoardInfo {}

interface Confort extends Card {}
interface Improvement extends Card {}
interface Traveler extends Card {}
interface Valley extends Card {}

interface HouseToken {
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

interface CardType {
   name: string;
   type?: 'outdoor' | 'food' | 'clothing' | 'lighting';
   score: number;
}

/////////////////////////////////////////////
// States
interface StateHandler {
   onEnteringState(args: any): void;
   onLeavingState(): void;
   onUpdateActionButtons(args: any): void;
   restoreGameState(): Promise<boolean>;
}

/**
 * Notifications
 */
