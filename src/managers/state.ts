class StateManager {
   private readonly states: { [statename: string]: StateHandler };
   private readonly client_states: StateHandler[] = [];
   public current: StateHandler;

   constructor(private game: CreatureConforts) {
      this.states = {
         startHand: new StartHandState(game),
         placement: new PlacementState(game),
         playerTurnDice: new PlayerTurnDiceState(game),
         playerTurnResolve: new PlayerTurnResolveState(game),
         playerTurnCraftConfort: new PlayerTurnCraftState(game),
      };
   }

   onEnteringState(stateName: string, args: any): void {
      debug('Entering state: ' + stateName);

      if (this.states[stateName] !== undefined) {
         this.states[stateName].onEnteringState(args.args);
         if (stateName.startsWith('client_')) {
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
