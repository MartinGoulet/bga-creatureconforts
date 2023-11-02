<?php

namespace CreatureConforts\Cards\Comforts;

use CreatureConforts\Managers\Conforts;

class Bread {
    public function getScore(int $player_id, int $card_id) {
        // +2 if you also have soup;
        $cards = Conforts::getPlayerBoard($player_id);
        foreach ($cards as $card) {
            $type = intval($card['type']);
            if ($type === 16) {
                return 2;
            }
        }
        return 0;
    }
}