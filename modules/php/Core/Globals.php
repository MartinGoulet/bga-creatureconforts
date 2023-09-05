<?php

namespace CreatureConforts\Core;

/*
 * Globals: Access to global variables
 */

class Globals extends \APP_DbObject {

    public static function getFirstPlayerId() {
        return intval(Game::get()->getGameStateValue(VAR_FIRST_PLAYER));
    }

    public static function getRiverDialValue() {
        return intval(Game::get()->getGameStateValue(VAR_RIVER_DIAL));
    }

    public static function getWorkerPlacement(int $player_id) {
        return self::get("locations_" . $player_id);
    }

    public static function setWorkerPlacement(int $player_id, $locations_id) {
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
