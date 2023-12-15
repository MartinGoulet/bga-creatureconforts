class ResourceRequirement {
   static isRequirementMet(game: CreatureComforts, cost: { [type: string]: number }): boolean {
      const { counters } = game.getPlayerPanel(game.getPlayerId());

      for (const type of Object.keys(cost)) {
         if (type !== '*' && counters[type].getValue() < cost[type]) {
            if (['stone', 'coin'].includes(type) && TravelerHelper.isActiveHairyTailedHole()) {
               const sumResource = counters['stone'].getValue() + counters['coin'].getValue();
               const sumCost = (cost?.stone ?? 0) + (cost?.coin ?? 0);
               if (sumResource < sumCost) {
                  return false;
               }
            } else {
               return false;
            }
         }
      }

      if ('*' in cost) {
         const total_goods = GOODS.map((type) => counters[type].getValue()).reduce(
            (prev, curr) => prev + curr,
            0,
         );

         const total_cost = Object.keys(cost)
            .filter((type) => ICONS.indexOf(type as IconsType) >= 0)
            .map((type) => cost[type])
            .reduce((prev, curr) => prev + curr, 0);

         return total_goods >= total_cost;
      }

      return true;
   }
}
