<?php

namespace CreatureComforts\Managers;

use BgaUserException;
use CreatureComforts\Core\Game;

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

    static function getWorkersFromPlayer(int $player_id) {
        $players = Game::get()->loadPlayersBasicInfos();
        $player_color = $players[$player_id]['player_color'];
        return self::deck()->getCardsOfType($player_color);
    }

    static function moveToLocation($worker_id, $location_id) {
        if ($location_id <= 12) {
            self::deck()->moveCard($worker_id, 'board', $location_id);
        } else {
            self::deck()->moveCard($worker_id, 'improvement', $location_id);
        }
    }

    static function returnToPlayerBoard(int $player_id, int $location_id) {
        $workers = self::getWorkersFromPlayer($player_id);
        $worker = array_values(array_filter($workers, function ($worker) use ($location_id) {
            return intval($worker['location_arg']) == $location_id;
        }));
        if(sizeof($worker) == 0) return null;
        self::deck()->moveCard($worker[0]['id'], 'player');
        return self::deck()->getCard($worker[0]['id']);
    }

    /**
     * @return \Deck
     */
    private static function deck() {
        return Game::get()->workers;
    }
}
