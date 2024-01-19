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

interface NotifGuestCottageArgs {
   player_id: number;
   player_id2: number;
   resources: { [type: string]: number }[];
}
