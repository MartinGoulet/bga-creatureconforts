<?php

namespace CreatureComforts\Cards\Comforts;

use CreatureComforts\Core\Globals;
use CreatureComforts\Helpers\ResourcesHelper;

class Pantry {
    public function getScore(int $player_id, int $card_id) {
        // + 2 for each set of [GRAIN, MUSHROOM, FRUIT] stored here
        $resources = Globals::getComfortResource($card_id);
        $group = ResourcesHelper::groupByType($resources);
        $has_resources =
            array_key_exists(GRAIN, $group) &&
            array_key_exists(MUSHROOM, $group) &&
            array_key_exists(FRUIT, $group);

        if (!$has_resources) return 0;
        return 2 * min([$group[GRAIN], $group[MUSHROOM], $group[FRUIT]]);
    }
}
