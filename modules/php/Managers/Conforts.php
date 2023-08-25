<?php

namespace CreatureConforts\Managers;

use CreatureConforts\Core\Game;

/*
 * Cards manager : allows to easily access card
 */
class Conforts {

    static function setup() {
        $cards = [];
        foreach (Game::get()->card_types as $id => $card_type) {
            $cards[] = ['type' => $id, 'type_arg' => 1, 'nbr' => 1];
            $cards[] = ['type' => $id, 'type_arg' => 2, 'nbr' => 1];
            $cards[] = ['type' => $id, 'type_arg' => 3, 'nbr' => 1];
        }
        self::deck()->createCards($cards);
        self::deck()->shuffle('deck');

        for ($i = 1; $i <= 4; $i++) {
            self::deck()->pickCardForLocation('deck', 'slot', $i);
        }
    }

    static function getBoard() {
        $cards = self::deck()->getCardsInLocation('slot', null, 'location_arg');
        return array_values($cards);
    }

    private static function deck() {
        return Game::get()->conforts;
    }
}
