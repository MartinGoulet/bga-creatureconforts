class PlayerDiceStock extends LineDiceStock {
   constructor(protected manager: DiceManager, protected element: HTMLElement) {
      super(manager, element, {
         gap: '8px',
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

   public addDie(die: BgaDie, animation?: DieAnimation, settings?: AddDieSettings): Promise<boolean> {
      const originStock = this.manager.getDieStock(die);
      if (originStock) {
         const originalDie = originStock.getDice().find((d) => d.id == die.id);
         if (originalDie.face !== die.face) {
            this.rollDie(die, { effect: 'turn', duration: 0 });
         }
      }
      return super.addDie(die, animation, settings);
   }

   public rollDie(die: BgaDie, settings?: RollDieSettings): void {
      super.rollDie(die, settings);

      const div = this.getDieElement(die);
      const faces = div.querySelector('.bga-dice_die-faces') as HTMLElement;
      faces.dataset.visibleFace = `${die.face}`;
   }
}

class DiceLocationStock extends SlotDiceStock {
   public onSlotClick: (slotId: SlotId, div: HTMLDivElement) => void;

   constructor(protected manager: DiceManager, protected element: HTMLElement) {
      super(manager, element, {
         slotsIds: [...arrayRange(1, 12)].flat(),
         mapDieToSlot: (die) => die.location,
         gap: '0',
      });
   }

   /**
    * Add new slots ids. Will not change nor empty the existing ones.
    *
    * @param slotsIds the new slotsIds. Will be merged with the old ones.
    */
   public addSlotElement(slotId: SlotId): HTMLDivElement {
      this.slotsIds.push(slotId);
      this.createSlot(slotId);
      const slot: HTMLDivElement = this.slots[slotId];
      return slot;
   }

   public bindSlotClick(slot: HTMLDivElement, slotId: SlotId) {
      slot.parentElement.addEventListener('click', (event) => {
         if (slot.children.length == 0) {
            this.onSlotClick?.(slotId, slot);
            return;
         }
         const die = this.dice.find((c) => this.manager.getId(c) == slot.children[0].id);
         if (!die) {
            return;
         }
         this.dieClick(die);
      });
   }
}
