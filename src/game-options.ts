class GameOptions {
   private turn_number: ebg.counter;

   constructor(private game: CreatureComforts) {
      this.setupGameInfo(game.gamedatas);
      this.setupGamePhase();
      this.game.updatePlayerOrdering();
   }

   public setPhase(phase: any) {
      document.getElementById('wg-phases').dataset.phase = phase.toString();
      document.getElementById('table').dataset.phase = phase.toString();
   }

   public setTurnNumber(value: number) {
      this.turn_number.toValue(value);
   }

   private setupGameInfo({ turn_number, nbr_turns }: CreatureComfortsGamedatas) {
      const display = document.getElementById('game-infos');
      if (display) {
         display.parentElement.removeChild(display);
      }

      const html = `
         <div class="player-board" id="game-infos">
            <div class="title">${_('Game informations')}</div>
            <div class="player-board-inner">
               <div id="game-infos-turn-number">${_(
                  'Turn : ',
               )} <span id="game-infos-turn-number-counter"></span> / ${nbr_turns}</div>
            </div>
         </div>`;

      document.getElementById('player_boards').insertAdjacentHTML('beforeend', html);

      this.turn_number = new ebg.counter();
      this.turn_number.create('game-infos-turn-number-counter');
      this.turn_number.setValue(turn_number);
   }

   private setupGamePhase() {
      const display = document.getElementById('game-phases');
      if (display) {
         display.parentElement.removeChild(display);
      }

      const { phase1, phase2, phase3, phase4, phase5, phase6 } = {
         phase1: _('New traveler'),
         phase2: _('Family dice'),
         phase3: _('Placement'),
         phase4: _('Village dice'),
         phase5: _('Player Turn'),
         phase6: _('Upkeep'),
      };

      const { phase5b, phase5c, phase5e } = {
         phase5b: _('Assign dice'),
         phase5c: _('Resolve locations'),
         phase5e: _('Craft Comforts'),
      };

      const html = `
         <div class="player-board" id="game-phases">
            <div class="title">${_('Turn order')}</div>
            <div class="player-board-inner">
               <ul id="wg-phases" data-phase="1">
                  <li><div class="wg-icon"></div><div class="wg-phase-name">1. ${phase1}</div></li>
                  <li><div class="wg-icon"></div><div class="wg-phase-name">2. ${phase2}</div></li>
                  <li><div class="wg-icon"></div><div class="wg-phase-name">3. ${phase3}</div></li>
                  <li><div class="wg-icon"></div><div class="wg-phase-name">4. ${phase4}</div></li>
                  <li><div class="wg-icon"></div><div class="wg-phase-name">5. ${phase5}</div></li>
                  <li class="sub"><div class="wg-icon"></div><div class="wg-phase-name">${phase5b}</div></li>
                  <li class="sub"><div class="wg-icon"></div><div class="wg-phase-name">${phase5c}</div></li>
                  <li class="sub"><div class="wg-icon"></div><div class="wg-phase-name">${phase5e}</div></li>
                  <li><div class="wg-icon"></div><div class="wg-phase-name">6. ${phase6}</div></li>
               </ul>
            </div>
         </div>`;

      document.getElementById('player_boards').insertAdjacentHTML('beforeend', html);
   }
}
