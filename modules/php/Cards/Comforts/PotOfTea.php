<?php

namespace CreatureComforts\Cards\Comforts;

use CreatureComforts\Managers\Comforts;

class PotOfTea {
    public function getScore(int $player_id, int $card_id) {
        // +2 if you also have a rocking chair;
        $cards = Comforts::getPlayerBoard($player_id);
        foreach ($cards as $card) {
            $type = intval($card['type']);
            if ($type === 6) {
                return 2;
            }
        }
        return 0;
    }
}
