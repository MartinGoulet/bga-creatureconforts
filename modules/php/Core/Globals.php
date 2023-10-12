<?php

namespace CreatureConforts\Core;

/*
 * Globals: Access to global variables
 */

class Globals extends \APP_DbObject {

    public static function getFirstPlayerId() {
        return intval(Game::get()->getGameStateValue(VAR_FIRST_PLAYER));
    }

    public static function setFirstPlayerId(int $player_id) {
        Game::get()->setGameStateValue(VAR_FIRST_PLAYER, $player_id);
    }

    public static function getRavenLocationIds() {
        return self::get("raven_locations_ids", true) ?? [];
    }

    public static function setRavenLocationIds(array $locations_ids) {
        self::set("raven_locations_ids", $locations_ids);
    }

    public static function getRiverDialValue() {
        return intval(Game::get()->getGameStateValue(VAR_RIVER_DIAL));
    }

    public static function setRiverDialValue(int $value) {
        Game::get()->setGameStateValue(VAR_RIVER_DIAL, $value);
    }

    public static function getWorkerPlacement(int $player_id) {
        return self::get("locations_" . $player_id);
    }

    public static function setWorkerPlacement(int $player_id, array $locations_id) {
        self::set("locations_" . $player_id, $locations_id);
    }

    /*************************
     **** GENERIC METHODS ****
     *************************/

    private static function set(string $name, /*object|array*/ $obj) {
        $jsonObj = json_encode($obj);
        self::DbQuery("INSERT INTO `global_variables`(`name`, `value`)  VALUES ('$name', '$jsonObj') ON DUPLICATE KEY UPDATE `value` = '$jsonObj'");
    }

    public static function get(string $name, $asArray = null) {
        /** @var string */
        $json_obj = self::getUniqueValueFromDB("SELECT `value` FROM `global_variables` where `name` = '$name'");
        if ($json_obj) {
            $object = json_decode($json_obj, $asArray);
            return $object;
        } else {
            return null;
        }
    }
}
