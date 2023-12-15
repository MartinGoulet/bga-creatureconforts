<?php

namespace CreatureComforts\Cards\Comforts;

use CreatureComforts\Managers\Comforts;

class Bread {
    public function getScore(int $player_id, int $card_id) {
        // +2 if you also have soup;
        $cards = Comforts::getPlayerBoard($player_id);
        foreach ($cards as $card) {
            $type = intval($card['type']);
            if ($type === 16) {
                return 2;
            }
        }
        return 0;
    }
}
