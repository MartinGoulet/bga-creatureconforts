<?php

namespace CreatureComforts\Cards\Comforts;

use CreatureComforts\Core\Globals;
use CreatureComforts\Helpers\ResourcesHelper;

class PiggyBank {
    public function getScore(int $player_id, int $card_id) {
        // + 2 for each COIN stored here
        $resources = Globals::getComfortResource($card_id);
        $group = ResourcesHelper::groupByType($resources);
        if (!array_key_exists(COIN, $group)) return 0;
        return 2 * $group[COIN];
    }
}
