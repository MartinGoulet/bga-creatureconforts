<?php

namespace CreatureComforts\Cards\Comforts;

use CreatureComforts\Managers\Comforts;

class Toboggan {
    public function getScore(int $player_id, int $card_id) {
        // +2 if you also have a muffler;
        $cards = Comforts::getPlayerBoard($player_id);
        foreach ($cards as $card) {
            $type = intval($card['type']);
            if ($type === 5) {
                return 2;
            }
        }
        return 0;
    }
}
