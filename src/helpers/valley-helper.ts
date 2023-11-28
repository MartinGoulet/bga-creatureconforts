class ValleyHelper {
   static getValleyLocationInfo(location_id: number): ValleyLocationInfo {
      const location = location_id <= 2 ? 'forest' : 'meadow';
      const card = ValleyHelper.game()
         .tableCenter.valley.getCards()
         .filter((card) => card.location == location)[0];
      return ValleyHelper.game().gamedatas.valley_types[Number(card.type_arg)].position[location_id];
   }
   private static game(): CreatureConforts {
      return (window as any).gameui as CreatureConforts;
   }
}
