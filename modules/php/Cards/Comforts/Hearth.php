<?php

namespace CreatureConforts\Cards\Comforts;

use CreatureConforts\Core\Globals;

class Hearth {
    public function getScore(int $player_id, int $card_id) {
        // + 2 for each [WOOD, WOOD] stored here
        $resources = Globals::getComfortResource($card_id);
        if (!array_key_exists(WOOD, $resources)) return 0;
        return 2 * intdiv($resources[WOOD], 2);
    }
}
