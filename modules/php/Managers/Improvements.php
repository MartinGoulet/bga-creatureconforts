<?php

namespace CreatureConforts\Managers;

use CreatureConforts\Core\Game;

/*
 * Cards manager : allows to easily access card
 */
class Improvements {

    static function setupNewGame() {
        $cards = [];
        foreach (range(1, 17) as $id) {
            $cards[] = ['type' => $id, 'type_arg' => 1, 'nbr' => 1];
            $cards[] = ['type' => $id, 'type_arg' => 2, 'nbr' => 1];
        }
        self::deck()->createCards($cards);
        self::deck()->shuffle('deck');

        for ($i = 1; $i <= 6; $i++) {
            self::deck()->pickCardForLocation('deck', 'slot', $i);
        }
    }

    static function getBoard() {
        $cards = self::deck()->getCardsInLocation('slot', null, 'location_arg');
        return array_values($cards);
    }

    private static function deck() {
        return Game::get()->improvements;
    }

}
