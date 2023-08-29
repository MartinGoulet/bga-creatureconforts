<?php

namespace CreatureConforts\Managers;

use CreatureConforts\Core\Game;

/*
 * Worker manager : allows to easily access worker
 */

class Worker extends \APP_DbObject {

    static function setupNewGame() {
        $players = Game::get()->loadPlayersBasicInfos();

        $workers = [];
        // Each player starts with 2 dice
        foreach ($players as $player_id => $player) {
            $workers[] = [
                'type' => $player['player_color'], 
                'type_arg' => $player['player_id'], 
                'nbr' => 4
            ];
        }
        self::deck()->createCards($workers);
        self::deck()->moveAllCardsInLocation('deck', 'player');
    }

    static function getUIData() {
        return [
            'player' => array_values(self::deck()->getCardsInLocation('player')),
            'board' => array_values(self::deck()->getCardsInLocation('board')),
            'improvement' => array_values(self::deck()->getCardsInLocation('improvement')),
        ];
    }

    /**
     * @return \Deck
     */
    private static function deck() {
        return Game::get()->workers;
    }
}
