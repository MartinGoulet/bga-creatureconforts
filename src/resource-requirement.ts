class ResourceRequirement {
   static isRequirementMet(game: CreatureConforts, cost: { [type: string]: number }): boolean {
      const { counters } = game.getPlayerPanel(game.getPlayerId());

      for (const type of Object.keys(cost)) {
         if (type !== '*' && counters[type].getValue() < cost[type]) {
            return false;
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
