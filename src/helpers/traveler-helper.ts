class TravelerHelper {
   static setTravelerToTable() {
      const game = (window as any).gameui as CreatureComforts;
      const traveler = game.tableCenter.traveler_deck.getTopCard().type;
      document.getElementById('table').dataset.traveler = traveler;
   }

   static isActiveLeopardFrog(): boolean {
      return this.isTravelerActive(2);
   }

   static isActivePileatedWoodpecker(): boolean {
      return this.isTravelerActive(3);
   }

   static isActiveHairyTailedHole(): boolean {
      return this.isTravelerActive(5);
   }

   static isActiveAmericanBeaver(): boolean {
      return this.isTravelerActive(8);
   }

   static isActivePineMarten(): boolean {
      return this.isTravelerActive(11);
   }

   private static isTravelerActive(type: number): boolean {
      const game = (window as any).gameui as CreatureComforts;
      if (Number(game.gamedatas.gamestate.id) > 90) return false;
      return Number(game.tableCenter.traveler_deck.getTopCard().type) === type;
   }
}
