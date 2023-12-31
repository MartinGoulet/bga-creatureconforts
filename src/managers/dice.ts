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
   constructor(game: CreatureComforts) {
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
