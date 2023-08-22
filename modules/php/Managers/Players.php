<?php

namespace CreatureConforts\Managers;

use CreatureConforts\Core\Game;

/*
 * Players manager : allows to easily access players
 */

class Players extends \APP_DbObject {

    static function getPlayerId() {
        return intval(Game::get()->getActivePlayerId());
    }

    public static function getPlayersInOrder($player_id = null) {
        $result = [];

        $players = Game::get()->loadPlayersBasicInfos();
        $next_player = Game::get()->getNextPlayerTable();
        if ($player_id == null) {
            $player_id = Players::getPlayerId();
        }

        // Check for spectator
        if (!key_exists($player_id, $players)) {
            $player_id = $next_player[0];
        }

        // Build array starting with current player
        for ($i = 0; $i < count($players); $i++) {
            $result[$player_id] = $players[$player_id];
            $player_id = $next_player[$player_id];
        }

        return $result;
    }
}
