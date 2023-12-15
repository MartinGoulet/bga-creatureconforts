class TravelerWildTurkeyStates implements StateHandler {
   public isMultipleActivePlayer: boolean = true;

   private toolbar: ToolbarContainer = new ToolbarContainer('wild-turkey');

   constructor(private game: CreatureComforts) {}

   onEnteringState(args: TravelerWildTurkeyArgs): void {
      const { dice, player_color } = this.game.getCurrentPlayerTable();

      this.addDiceSelector(player_color);

      const handleDiceSelection = (selection: Dice[]) => {
         this.toolbar
            .getContainer()
            .querySelectorAll('.colored-die')
            .forEach((div) => div.classList.remove('disabled', 'selected'));
         if (selection.length == 1) {
            document.getElementById(`die-wt-${selection[0].face}`).classList.add('disabled');
         } else {
            this.toolbar
               .getContainer()
               .querySelectorAll('.colored-die')
               .forEach((div) => div.classList.add('disabled'));
         }
         this.game.disableButton('btn_confirm');
      };

      if (this.game.isCurrentPlayerActive()) {
         dice.setSelectionMode('single');
         dice.onSelectionChange = handleDiceSelection;
      } else {
         this.displayDiceSelection(args._private);
      }
   }
   private displayDiceSelection({ die_id, die_value }: { die_id: number; die_value: number }) {
      const { dice } = this.game.getCurrentPlayerTable();
      dice.setSelectionMode('none');
      dice.onSelectionChange = undefined;

      if (die_id === 0) return;
      if (!this.toolbar.getContainer()) return;

      const die = this.game
         .getCurrentPlayerTable()
         .dice.getDice()
         .filter((die) => die.id == die_id)[0];
      const divDie = this.game.diceManager.getDieElement(die);
      divDie.classList.add('bga-dice_selected-die');

      this.toolbar
         .getContainer()
         .querySelectorAll('.disabled')
         .forEach((div: HTMLDivElement) => {
            div.classList.toggle('disabled', div.dataset.face === die.face.toString());
            div.classList.toggle('selected', div.dataset.face === die_value.toString());
         });
   }

   private addDiceSelector(player_color: string) {
      const handleChoiceClick = (div: HTMLDivElement) => {
         if (!this.game.isCurrentPlayerActive()) return;
         if (div.classList.contains('disabled')) return;
         if (!div.classList.contains('selected')) {
            this.toolbar
               .getContainer()
               .querySelectorAll('.selected')
               .forEach((div) => div.classList.remove('selected'));
         }
         div.classList.toggle('selected');
         this.game.toggleButtonEnable('btn_confirm', div.classList.contains('selected'), 'blue');
      };

      const root = this.toolbar.addContainer();
      arrayRange(1, 6).forEach((value) => {
         root.insertAdjacentHTML(
            'beforeend',
            `<div id="die-wt-${value}" data-face="${value}" class="disabled bga-dice_die bga-dice_die6 colored-die" data-color="${player_color}">
               <div class="bga-dice_die-face" data-face="${value}"></div>
            </div>`,
         );
         const div = document.getElementById(`die-wt-${value}`) as HTMLDivElement;
         div.onclick = () => handleChoiceClick(div);
      });
   }

   onLeavingState(): void {}

   onUpdateActionButtons(args: any): void {
      const handleConfirm = () => {
         const die_value = Number(
            (this.toolbar.getContainer().querySelector('.selected') as HTMLDivElement).dataset.face,
         );
         const die_id = this.game.getCurrentPlayerTable().dice.getSelection()[0].id;
         this.game.takeAction('confirmWildTurkey', { die_id, die_value }, () => {
            this.displayDiceSelection({ die_id, die_value });
         });
      };

      const handlePass = () => {
         this.game.takeAction('confirmWildTurkey', { die_id: 0, die_value: 0 }, () => {
            this.displayDiceSelection({ die_id: 0, die_value: 0 });
         });
      };

      const handleCancel = () => {
         this.game.takeAction('cancelWildTurkey', {}, () => {
            this.game.restoreGameState();
         });
      };

      if (this.game.isCurrentPlayerActive()) {
         this.game.addActionButtonDisabled('btn_confirm', _('Confirm'), handleConfirm);
         this.game.addActionButtonRed('btn_pass', _('Pass'), handlePass);
      } else {
         this.game.addActionButtonGray('btn_cancel', _('Cancel'), handleCancel);
      }
   }
}

class TravelerWildTurkeyEndStates implements StateHandler {
   public isMultipleActivePlayer: boolean = true;
   private toolbar: ToolbarContainer = new ToolbarContainer('wild-turkey');
   constructor(private game: CreatureComforts) {}
   onEnteringState(args: any): void {
      const { dice } = this.game.getCurrentPlayerTable();
      dice.setSelectionMode('none');
      dice.onSelectionChange = undefined;
      this.toolbar.removeContainer();
      document
         .querySelectorAll('.bga-dice_selected-die')
         .forEach((div: HTMLDivElement) => div.classList.remove('bga-dice_selected-die'));
   }
   onLeavingState(): void {}
   onUpdateActionButtons(args: any): void {}
}

interface TravelerWildTurkeyArgs {
   _private: {
      die_id: number;
      die_value: number;
   };
}
