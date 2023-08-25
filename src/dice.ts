class ColoredDie6 extends BgaDie6 {
   constructor(private color: string, private size: number = 40) {
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
         },
      });
   }
}
