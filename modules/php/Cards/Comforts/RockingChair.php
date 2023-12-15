<?php

namespace CreatureComforts\Cards\Comforts;

use CreatureComforts\Managers\Comforts;

class RockingChair {
    public function getScore(int $player_id, int $card_id) {
        // +2 if you also have quilt;
        $cards = Comforts::getPlayerBoard($player_id);
        foreach ($cards as $card) {
            $type = intval($card['type']);
            if ($type === 21) {
                return 2;
            }
        }
        return 0;
    }
}
