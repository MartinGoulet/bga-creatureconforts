<?php

namespace CreatureComforts\Cards\Comforts;

use CreatureComforts\Core\Globals;

class Lamp {
    public function getScore(int $player_id, int $card_id) {
        // + 7 if you store exactly [STORY, STORY] here
        $resources = Globals::getComfortResource($card_id);
        if (!array_key_exists(STORY, $resources)) return 0;
        return $resources[STORY] === 2 ? 7 : 0;
    }
}
