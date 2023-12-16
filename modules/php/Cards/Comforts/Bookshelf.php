<?php

namespace CreatureComforts\Cards\Comforts;

use CreatureComforts\Core\Globals;
use CreatureComforts\Helpers\ResourcesHelper;

class Bookshelf {
    public function getScore(int $player_id, int $card_id) {
        // + 3 for each STORY stored here
        $resources = Globals::getComfortResource($card_id);
        $group = ResourcesHelper::groupByType($resources);
        if (!array_key_exists(STORY, $group)) return 0;
        return 3 * $group[STORY];
    }
}
