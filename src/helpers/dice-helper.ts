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
      } else {
         return true;
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

      const nextValues = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 1, 7: 2, 8: 3, 9: 4, 10: 5, 11: 6, 12: 1 };

      switch (this.location_id) {
         case 5:
            return dieValue == this.dial;
         case 6:
            return dieValue == nextValues[this.dial] || dieValue == nextValues[this.dial + 1];
         case 7:
            return (
               dieValue == nextValues[this.dial + 2] ||
               dieValue == nextValues[this.dial + 3] ||
               dieValue == nextValues[this.dial + 4]
            );
         default:
            return false;
      }
   }
}
