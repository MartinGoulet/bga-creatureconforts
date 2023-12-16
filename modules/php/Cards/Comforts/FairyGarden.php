<?php

namespace CreatureComforts\Cards\Comforts;

use CreatureComforts\Core\Globals;
use CreatureComforts\Helpers\ResourcesHelper;

class FairyGarden {
    public function getScore(int $player_id, int $card_id) {
        // + 8 for each set of GOODS stored here
        $resources = Globals::getComfortResource($card_id);
        $group = ResourcesHelper::groupByType($resources);

        $has_resources =
            array_key_exists(WOOD, $group) &&
            array_key_exists(STONE, $group) &&
            array_key_exists(GRAIN, $group) &&
            array_key_exists(MUSHROOM, $group) &&
            array_key_exists(YARN, $group) &&
            array_key_exists(FRUIT, $group);

        if (!$has_resources) return 0;
        return 8 * min([
            $group[WOOD], $group[STONE], $group[GRAIN],
            $group[MUSHROOM], $group[YARN], $group[FRUIT],
        ]);
    }
}
