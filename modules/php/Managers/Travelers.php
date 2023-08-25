<?php

namespace CreatureConforts\Managers;

use CreatureConforts\Core\Game;

/*
 * Cards manager : allows to easily access card
 */

class Travelers {

    static function setupNewGame() {
        $cards = [];
        foreach (Game::get()->traveler_types as $id => $card_type) {
            $cards[] = ['type' => $id, 'type_arg' => 1, 'nbr' => 1];
        }
        self::deck()->createCards($cards);
        self::deck()->shuffle('deck');
    }

    static function getBoard() {
        return [self::deck()->getCardOnTop('deck')];
    }

    private static function deck() {
        return Game::get()->travelers;
    }
}
