<?php

namespace CreatureComforts\Cards\Comforts;

use CreatureComforts\Core\Globals;

class Pantry {
    public function getScore(int $player_id, int $card_id) {
        // + 2 for each set of [GRAIN, MUSHROOM, FRUIT] stored here
        $resources = Globals::getComfortResource($card_id);
        $has_resources =
            array_key_exists(GRAIN, $resources) &&
            array_key_exists(MUSHROOM, $resources) &&
            array_key_exists(FRUIT, $resources);

        if (!$has_resources) return 0;
        return 2 * min([$resources[GRAIN], $resources[MUSHROOM], $resources[FRUIT]]);
    }
}
