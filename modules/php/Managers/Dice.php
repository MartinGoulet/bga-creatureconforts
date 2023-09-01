<?php

namespace CreatureConforts\Managers;

use CreatureConforts\Core\Game;

/*
 * Dice manager : allows to easily access dice
 */

class Dice extends \APP_DbObject {

    static function setupNewGame($players, $options) {
        $players = Game::get()->loadPlayersBasicInfos();
        $sql = "INSERT INTO dice (dice_owner_id, dice_color, dice_value, dice_location) VALUES ";
        $values = [];

        // 4 starting white dice
        for ($i = 0; $i < 4; $i++) {
            $values[] = "(null, 'white', 1, null)";
        }

        // Each player starts with 2 dice
        foreach ($players as $player_id => $player) {
            $player_color = $player['player_color'];
            $values[] = "(" . $player_id . ", '" . $player_color . "', 1, null)";
            $values[] = "(" . $player_id . ", '" . $player_color . "', 1, null)";
        }

        $sql .= implode(',', $values);
        self::DbQuery($sql);
    }

    static function getUIData() {
        $sql = "SELECT dice_id id, dice_color type, dice_value face, dice_owner_id owner_id, dice_location location FROM dice";
        return array_values(self::getCollectionFromDb($sql));
    }

    static function countDiceInLocation(int $location_id) {
        return intval(self::getUniqueValueFromDB("SELECT count(1) FROM dice WHERE dice_location = $location_id"));
    }

    static function getDice(array $dice_ids) {
        $dice_ids = implode(',', $dice_ids);
        $sql = "SELECT dice_id id, dice_color type, dice_value face, dice_owner_id owner_id, dice_location location FROM dice WHERE dice_id in ($dice_ids)";
        return array_values(self::getCollectionFromDb($sql));
    }

    static function getDiceFromPlayer(int $player_id) {
        $sql = "SELECT dice_id id, dice_color type, dice_value face, dice_owner_id owner_id, dice_location location FROM dice WHERE dice_owner_id = $player_id";
        return array_values(self::getCollectionFromDb($sql));
    }

    static function getPlayerDice() {
        $sql = "SELECT dice_id id, dice_value face FROM dice WHERE dice_color != 'white'";
        return array_values(self::getCollectionFromDb($sql));
    }

    static function moveDiceToLocation(array $dice_ids, int $location_id) {
        $ids = implode(',', $dice_ids);
        self::DbQuery("UPDATE dice SET dice_location = $location_id WHERE dice_id in ($ids)");
    }

    static function movePlayerDiceToHill($player_id) {
        self::DbQuery("UPDATE dice SET dice_location = 0 WHERE dice_owner_id = $player_id OR dice_owner_id is null");
    }

    static function throwPlayerDice() {
        $sql = "SELECT dice_id id, dice_value face FROM dice WHERE dice_color != 'white'";
        $dice = self::getCollectionFromDb($sql);
        self::throwDice($dice);
    }

    static function throwWhiteDice() {
        $sql = "SELECT dice_id id, dice_value face FROM dice WHERE dice_color = 'white'";
        $dice = self::getCollectionFromDb($sql);
        self::throwDice($dice);
    }

    private static function throwDice($dice) {
        foreach ($dice as $die_id => $die) {
            $value = bga_rand(1, 6);
            self::DbQuery("UPDATE dice SET dice_value = $value WHERE dice_id = $die_id;");
        }
    }
}
