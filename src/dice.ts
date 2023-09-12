class ColoredDie6 extends BgaDie6 {
   constructor(private color: string, public size: number = 40) {
      super({ borderRadius: 12 });
   }

   setupDieDiv(die, element) {
      super.setupDieDiv(die, element);
      element.classList.add('colored-die');
      element.dataset.color = '' + this.color;
   }

   setupFaceDiv(die, element, face) {}
}

class MyDiceManager extends DiceManager {
   constructor(game: CreatureConforts) {
      super(game, {
         dieTypes: {
            gray: new ColoredDie6('gray'),
            green: new ColoredDie6('green'),
            purple: new ColoredDie6('purple'),
            red: new ColoredDie6('red'),
            yellow: new ColoredDie6('yellow'),
            white: new ColoredDie6('white'),

            '7e797b': new ColoredDie6('gray'),
            '13586b': new ColoredDie6('green'),
            '650e41': new ColoredDie6('purple'),
            b7313e: new ColoredDie6('red'),
            dcac28: new ColoredDie6('yellow'),
         },
      });
   }
}

class PlayerDiceStock extends LineDiceStock {
   constructor(protected manager: DiceManager, protected element: HTMLElement) {
      super(manager, element, {
         gap: '10px',
         sort: sortFunction('id'),
      });
   }

   public rollDie(die: BgaDie, settings?: RollDieSettings): void {
      super.rollDie(die, settings);

      const div = this.getDieElement(die);
      const faces = div.querySelector('.bga-dice_die-faces') as HTMLElement;
      faces.dataset.visibleFace = `${die.face}`;
   }
}

class VillageDiceStock extends LineDiceStock {
   constructor(protected manager: DiceManager, protected element: HTMLElement) {
      super(manager, element, {
         gap: '5px',
         sort: sortFunction('id'),
      });
   }

   public rollDie(die: BgaDie, settings?: RollDieSettings): void {
      super.rollDie(die, settings);

      const div = this.getDieElement(die);
      const faces = div.querySelector('.bga-dice_die-faces') as HTMLElement;
      faces.dataset.visibleFace = `${die.face}`;
   }
}
