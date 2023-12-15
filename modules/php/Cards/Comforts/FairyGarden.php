<?php

namespace CreatureComforts\Cards\Comforts;

use CreatureComforts\Core\Globals;

class FairyGarden {
    public function getScore(int $player_id, int $card_id) {
        // + 8 for each set of GOODS stored here
        $resources = Globals::getComfortResource($card_id);
        $has_resources =
            array_key_exists(WOOD, $resources) &&
            array_key_exists(STONE, $resources) &&
            array_key_exists(GRAIN, $resources) &&
            array_key_exists(MUSHROOM, $resources) &&
            array_key_exists(YARN, $resources) &&
            array_key_exists(FRUIT, $resources);

        if (!$has_resources) return 0;
        return 8 * min([
            $resources[WOOD], $resources[STONE], $resources[GRAIN],
            $resources[MUSHROOM], $resources[YARN], $resources[FRUIT],
        ]);
    }
}
