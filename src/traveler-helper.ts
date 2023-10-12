class TravelerHelper {
   static isHairyTailedHoleActive(): boolean {
      return this.isTravelerActive(5);
   }

   private static isTravelerActive(type: number): boolean {
      const game = (window as any).gameui as CreatureConforts;
      return Number(game.tableCenter.traveler_deck.getTopCard().type) === type;
   }
}
