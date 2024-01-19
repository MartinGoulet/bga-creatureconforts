class StateManager {
   private readonly states: { [statename: string]: StateHandler };
   private readonly client_states: StateHandler[] = [];
   public current: StateHandler;

   constructor(private game: CreatureComforts) {
      this.states = {
         startHand: new StartHandState(game),
         placement: new PlacementState(game),
         playerTurnDice: new PlayerTurnDiceState(game),
         playerTurnResolve: new PlayerTurnResolveState(game),
         playerTurnCraftConfort: new PlayerTurnCraftState(game),
         resolvePlayerTurnDiceManipulation: new PlayerTurnDiceManipulationState(game),
         resolveGuestCottageGive: new ResolveGuestCottageGiveState(game),
         resolveGuestCottageTake: new ResolveGuestCottageTakeState(game),
         resolveTraveler: new ResolveTravelerState(game),
         resolveTravelerDiscard: new ResolveTravelerDiscardState(game),
         resolveMarket: new ResolveMarketState(game),
         resolveOwnNest: new ResolveOwlNestState(game),
         resolveWheelbarrow: new ResolveWheelbarrowState(game),
         resolveWorkshop: new ResolveWorkshopState(game),
         playerTurnDiscard: new PlayerTurnDiscardState(game),
         upkeep: new UpkeepState(game),
         preEndOfGame: new PreEndGame(game),

         bicycle: new ImprovementBicycleState(game),
         resolveBicycleDestination: new ImprovementBicycleDestinationState(game),

         grayWolf: new TravelerGrayWolfState(game),
         canadaLynx: new TravelerCanadaLynxState(game),
         commonRaven: new TravelerCommonRavenState(game),
         stripedSkunk: new TravelerStripedSkunkStates(game),
         commonLoon: new PlacementState(game),
         moose: new TravelerMooseState(game),
         wildTurkey: new TravelerWildTurkeyStates(game),
         wildTurkeyEnd: new TravelerWildTurkeyEndStates(game),
      };
   }

   onEnteringState(stateName: string, args: any): void {
      debug('Entering state: ' + stateName);

      if (args.phase) {
         this.game.gameOptions.setPhase(args.phase);
      } else {
         this.game.gameOptions.setPhase('99');
      }

      if (this.states[stateName] !== undefined) {
         this.states[stateName].onEnteringState(args.args);
         if (stateName.startsWith('resolve')) {
            this.client_states.push(this.states[stateName]);
         } else {
            this.client_states.splice(0);
         }
      } else {
         this.client_states.splice(0);
         if (isDebug) {
            console.warn('State not handled', stateName);
         }
      }
      console.log('client states', this.client_states);
   }

   onLeavingState(stateName: string): void {
      debug('Leaving state: ' + stateName);

      if (this.states[stateName] !== undefined) {
         if (this.game.isCurrentPlayerActive()) {
            this.states[stateName].onLeavingState();
         } else if ('isMultipleActivePlayer' in this.states[stateName]) {
            this.states[stateName].onLeavingState();
         }
      }
   }

   onUpdateActionButtons(stateName: string, args: any): void {
      debug('onUpdateActionButtons: ' + stateName);
      if (this.states[stateName] !== undefined) {
         if (this.game.isCurrentPlayerActive()) {
            this.states[stateName].onUpdateActionButtons(args);
         } else if ('isMultipleActivePlayer' in this.states[stateName]) {
            this.states[stateName].onUpdateActionButtons(args);
         }
      }
   }

   async restoreGameState() {
      return new Promise(async (resolve) => {
         while (this.client_states.length > 0) {
            const state = this.client_states.pop();
            if ((state as any).restoreGameState) {
               await (state as any).restoreGameState();
            }
         }
         resolve(true);
      });
   }
}
