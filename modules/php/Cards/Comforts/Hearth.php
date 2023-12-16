<?php

namespace CreatureComforts\Cards\Comforts;

use CreatureComforts\Core\Globals;
use CreatureComforts\Helpers\ResourcesHelper;

class Hearth {
    public function getScore(int $player_id, int $card_id) {
        // + 2 for each [WOOD, WOOD] stored here
        $resources = Globals::getComfortResource($card_id);
        $group = ResourcesHelper::groupByType($resources);
        if (!array_key_exists(WOOD, $group)) return 0;
        return 2 * intdiv($group[WOOD], 2);
    }
}
