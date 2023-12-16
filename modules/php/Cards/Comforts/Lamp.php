<?php

namespace CreatureComforts\Cards\Comforts;

use CreatureComforts\Core\Globals;
use CreatureComforts\Helpers\ResourcesHelper;

class Lamp {
    public function getScore(int $player_id, int $card_id) {
        // + 7 if you store exactly [STORY, STORY] here
        $resources = array_values(Globals::getComfortResource($card_id));
        $group = ResourcesHelper::groupByType($resources);
        if (!array_key_exists(STORY, $group)) return 0;
        return $group[STORY] === 2 ? 7 : 0;
    }
}
