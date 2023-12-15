<?php

namespace CreatureComforts\Cards\Comforts;

use CreatureComforts\Core\Globals;

class PiggyBank {
    public function getScore(int $player_id, int $card_id) {
        // + 2 for each COIN stored here
        $resources = Globals::getComfortResource($card_id);
        if (!array_key_exists(COIN, $resources)) return 0;
        return 2 * $resources[COIN];
    }
}
