<?php

namespace CreatureComforts\Cards\Comforts;

use CreatureComforts\Managers\Comforts;

class BoardGame {
    public function getScore(int $player_id, int $card_id) {
        // + 1 for each other Board Game and Toyrs Comfort you have.
        $score = 0;
        $cards = Comforts::getPlayerBoard($player_id);
        foreach ($cards as $card) {
            $type = intval($card['type']);
            if ($type === 1 || $type === 18) {
                $score += 1;
            }
        }
        $score -= 1; // Don't count the first board game
        return $score;
    }
}
