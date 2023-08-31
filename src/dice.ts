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

interface DiceRequirement {
   isRequirementMet(values: number[]): boolean;
}

class DiceHelper {
   constructor(private game: CreatureConforts) {}

   getTotalDiceSlot(location_id: number) {
      if (location_id > 4) {
         return 1;
      }
      return this.getValleyLocationInfo(location_id).count;
   }

   isRequirementMet(location_id: number, dice: Dice[]): boolean {
      if (dice.length == 0) return true;

      let requirement: DiceRequirement = null;

      if (location_id >= 1 && location_id <= 4) {
         const info = this.getValleyLocationInfo(location_id);
         // If number of dice is required, we reject if not all dice are present
         if (info.count > 0 && info.count !== dice.length) return false;
         // Get requirement
         requirement = this.getValleyRequirement(info);
      } else if (location_id >= 5 && location_id <= 7) {
         requirement = new DialRequirement(this.game.gamedatas.river_dial, location_id);
      }
      return requirement.isRequirementMet(dice.map((d) => Number(d.face)).sort((a, b) => a - b));
   }

   private getValleyLocationInfo(location_id: number): ValleyLocationInfo {
      const location = location_id <= 2 ? 'forest' : 'meadow';
      const card = this.game.tableCenter.valley.getCards().filter((card) => card.location == location)[0];
      return this.game.gamedatas.valley_types[Number(card.type_arg)].position[location_id];
   }

   private getValleyRequirement({ count, values, rule }: ValleyLocationInfo): DiceRequirement {
      if (values) {
         return new ValuesRequirement(values);
      }

      switch (rule) {
         case '3_OR_UNDER':
            return new ValueTotalLowerRequirement(3);
         case '4_OR_HIGHER':
            return new ValueTotalHigherRequirement(4);
         case 'TOTAL_5_OR_LOWER':
            return new ValueTotalLowerRequirement(7);
         case 'TOTAL_6_OR_LOWER':
            return new ValueTotalLowerRequirement(7);
         case 'TOTAL_7_OR_HIGHER':
            return new ValueTotalHigherRequirement(7);
         case 'TOTAL_10_OR_HIGHER':
            return new ValueTotalHigherRequirement(10);
         case 'TOTAL_11_OR_HIGHER':
            return new ValueTotalHigherRequirement(11);
         case 'TOTAL_7':
            return new ValueTotalExactRequirement(7);
         case 'TOTAL_8':
            return new ValueTotalExactRequirement(8);
         case 'SAME_VALUE':
            return new SameValueRequirement();
         case 'ALL_EVEN':
            return new AllEvenRequirement();
         case 'ALL_ODD':
            return new AllOddRequirement();
         case 'STRAIGHT':
            return new StraightRequirement();
         default:
            this.game.showMessage('Rule not implemented', 'error');
      }
   }
}

class ValuesRequirement implements DiceRequirement {
   constructor(private values: number[]) {}
   isRequirementMet(values: number[]): boolean {
      return values.every((val, index) => val == this.values[index]);
   }
}

class ValueTotalExactRequirement implements DiceRequirement {
   constructor(private total: number) {}
   isRequirementMet(values: number[]): boolean {
      const sum = values.reduce((total, value) => (total += value), 0);
      return sum == this.total;
   }
}

class ValueTotalLowerRequirement implements DiceRequirement {
   constructor(private total: number) {}
   isRequirementMet(values: number[]): boolean {
      const sum = values.reduce((total, value) => (total += value), 0);
      return sum <= this.total;
   }
}
class ValueTotalHigherRequirement implements DiceRequirement {
   constructor(private total: number) {}
   isRequirementMet(values: number[]): boolean {
      const sum = values.reduce((total, value) => (total += value), 0);
      return sum >= this.total;
   }
}

class SameValueRequirement implements DiceRequirement {
   isRequirementMet(values: number[]): boolean {
      const firstNumber = values[0];
      return values.every((val) => val == firstNumber);
   }
}

class AllEvenRequirement implements DiceRequirement {
   isRequirementMet(values: number[]): boolean {
      return values.every((val) => val % 2 == 0);
   }
}

class AllOddRequirement implements DiceRequirement {
   isRequirementMet(values: number[]): boolean {
      return values.every((val) => val % 2 == 1);
   }
}

class StraightRequirement implements DiceRequirement {
   isRequirementMet(values: number[]): boolean {
      const firstNumber = values[0];
      return values.every((v, index) => firstNumber + index == v);
   }
}

class DialRequirement implements DiceRequirement {
   constructor(private dial: number, private location_id: number) {}
   isRequirementMet(values: number[]): boolean {
      const dieValue = values[0];
      switch (this.location_id) {
         case 5:
            return dieValue == this.dial;
         case 6: {
            const baseValue = (this.dial + 1) % 6;
            return dieValue == baseValue || dieValue == baseValue + 1;
         }
         case 7: {
            const baseValue = (this.dial + 3) % 6;
            return dieValue == baseValue || dieValue == baseValue + 1 || dieValue == baseValue + 2;
         }
         default:
            return false;
      }
   }
}
