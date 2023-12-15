<?php

namespace CreatureComforts\Cards\Comforts;

use CreatureComforts\Core\Globals;

class Bookshelf {
    public function getScore(int $player_id, int $card_id) {
        // + 3 for each STORY stored here
        $resources = Globals::getComfortResource($card_id);
        if (!array_key_exists(STORY, $resources)) return 0;
        return 3 * $resources[STORY];
    }
}
