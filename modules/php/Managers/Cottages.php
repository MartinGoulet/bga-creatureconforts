<?php

namespace CreatureConforts\Managers;

use BgaUserException;
use CreatureConforts\Core\Game;

/*
 * Cards manager : allows to easily access card
 */

class Cottages {

    static function getUIData() {

        $result = [
            'improvements' => array_values(self::deck()->getCardsInLocation('improvement')),
            'players' => [],
        ];

        $players = Game::get()->loadPlayersBasicInfos();
        foreach ($players as $player_id => $player) {
            $result['players'][$player_id] = self::deck()->getCardsOnTop(4, "brd_$player_id");
        }

        return $result;
    }

    static function addToImprovement($card_id, $player_id) {
        $cottage = self::deck()->getCardOnTop("brd_$player_id");
        if ($cottage == null) {
            throw new BgaUserException("No more cottage available");
        }
        return self::deck()->pickCardForLocation("brd_$player_id", "improvement", $card_id);
    }

    static function setupNewGame($players, $options) {
        foreach ($players as $player_id => $player) {
            self::deck()->createCards([
                ['type' => $player['player_color'], 'type_arg' => $player_id, 'nbr' => 4]
            ], "brd_$player_id");
        }
    }

    /**
     * @return \Deck
     */
    private static function deck() {
        return Game::get()->cottages;
    }
}
