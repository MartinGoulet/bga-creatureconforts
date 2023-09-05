<?php

namespace CreatureConforts\Managers;

use CreatureConforts\Core\Game;

/*
 * Players manager : allows to easily access players
 */

class Players extends \APP_DbObject {

    public static function setupNewGame($players, $options) {
        $gameinfos = Game::get()->getGameinfos();
        $default_colors = $gameinfos['player_colors'];

        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = [];

        $firstPlayer = null;
        foreach ($players as $player_id => $player) {
            if ($firstPlayer === null) {
                $firstPlayer = $player_id;
            }
            $color = array_shift($default_colors);
            $values[] = "('" . $player_id . "','$color','" . $player['player_canal'] . "','" . addslashes($player['player_name']) . "','" . addslashes($player['player_avatar']) . "')";
        }
        $sql .= implode(',', $values);
        self::DbQuery($sql);
        Game::get()->reattributeColorsBasedOnPreferences($players, $gameinfos['player_colors']);
        Game::get()->reloadPlayersBasicInfos();

        Game::get()->setGameStateInitialValue(VAR_FIRST_PLAYER, $firstPlayer);

        $isShortGame = $options[OPTION_SHORT_GAME_ID] == OPTION_SHORT_GAME_ENABLED;

        $player_ids = array_keys($players);
        switch (sizeof($player_ids)) {
            case 3:
                if ($isShortGame) {
                    // Player 3 get 1 coin
                    self::addCoin(1, $player_ids[2]);
                }
                break;
            case 4:
                if ($isShortGame == false) {
                    // Player 3 get 1 coin
                    self::addCoin(1, $player_ids[2]);
                    // Player 4 get 1 coin
                    self::addCoin(1, $player_ids[3]);
                }
                break;
            case 5:
                if ($isShortGame == false) {
                    // Player 2 get 1 coin
                    self::addCoin(1, $player_ids[1]);
                    // Player 3 get 1 coin
                    self::addCoin(1, $player_ids[2]);
                }
                // Player 4 get 1 coin
                self::addCoin(1, $player_ids[3]);
                // Player 5 get 1 coin
                self::addCoin(1, $player_ids[4]);
                break;
        }
    }

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

    /**
     * Ressources
     */
    static function addCoin(int $count, int $player_id) {
        self::DbQuery("UPDATE player SET coin = coin + $count WHERE player_id = '$player_id'");
    }

    static function addResources(int $player_id, array $resources) {
        foreach ($resources as $resource_type => $count) {
            self::DbQuery("UPDATE player SET $resource_type = $resource_type + $count WHERE player_id = '$player_id'");
        }
    }

    static function hasEnoughResource(int $player_id, array $cost) {
        $values = ["player_id = $player_id"];
        foreach ($cost as $type => $count) {
            $values[] = "$type >= $count";
        }
        $criteria = implode(' AND ', $values);
        $sql = "SELECT Count(1) FROM player WHERE $criteria";
        return intval(self::getUniqueValueFromDB($sql)) == 1;
    }

    static function removeResource(int $player_id, array $cost) {
        $values = [];
        foreach ($cost as $type => $count) {
            $values[] = "$type = $type - $count";
        }
        $update = implode(', ', $values);
        $sql = "UPDATE player SET $update WHERE player_id = $player_id";
        self::DbQuery($sql);
    }
}
