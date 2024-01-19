<?php

namespace CreatureComforts\Core;

/*
 * Globals: Access to global variables
 */

class Globals extends \APP_DbObject {

    public static function getBlueJayActivated() {
        return self::get("blue_jay_activated", false) ?? false;
    }

    public static function setBlueJayActivated(bool $value) {
        self::set("blue_jay_activated", $value);
    }

    public static function getBlueJayInfo(int $player_id) {
        return self::get("blue_jay_" . $player_id, true) ?? [
            'location_id' => -1,
            'dice' => null,
        ];
    }

    public static function setBlueJayInfo(int $player_id, int $location_id, array $dice) {
        self::set("blue_jay_" . $player_id, [
            'location_id' => $location_id,
            'dice' => $dice,
        ]);
    }

    public static function getFirstPlayerId() {
        return intval(Game::get()->getGameStateValue(VAR_FIRST_PLAYER));
    }

    public static function setFirstPlayerId(int $player_id) {
        Game::get()->setGameStateValue(VAR_FIRST_PLAYER, $player_id);
    }

    public static function getMarketUsed() {
        return Game::get()->getGameStateValue(VAR_MARKET_USED) == 1;
    }

    public static function setMarketUsed(bool $value) {
        Game::get()->setGameStateValue(VAR_MARKET_USED, $value ? 1 : 0);
    }

    public static function getMooseActivated() {
        return self::get("moose_activated", false) ?? false;
    }

    public static function setMooseActivated(bool $value) {
        self::set("moose_activated", $value);
    }

    public static function getRavenLocationIds() {
        return self::get("raven_locations_ids", true) ?? [];
    }

    public static function setRavenLocationIds(array $locations_ids) {
        self::set("raven_locations_ids", $locations_ids);
    }

    public static function getScaleUsed() {
        return self::get("scale_used") ?? false;
    }

    public static function setScaleUsed(bool $value) {
        self::set("scale_used", $value);
    }

    public static function getWheelbarrow(int $player_id) {
        return self::get("wheelbarrow__" . $player_id, false) ?? 0;
    }

    public static function setWheelbarrow(int $player_id, int $location_id) {
        self::set("wheelbarrow__" . $player_id, $location_id);
    }

    public static function getWhiteDice() {
        return self::get('white_dice', true) ?? [];
    }

    public static function setWhiteDice(array $dice) {
        self::set('white_dice', $dice);
    }

    public static function getRiverDialValue() {
        return intval(Game::get()->getGameStateValue(VAR_RIVER_DIAL));
    }

    public static function setRiverDialValue(int $value) {
        Game::get()->setGameStateValue(VAR_RIVER_DIAL, $value);
    }

    public static function getWildTurkeyDice(int $player_id) {
        return self::get("wild_turkey_" . $player_id, true) ?? [];
    }

    public static function setWildTurkeyDice(int $player_id, array $dice_info) {
        self::set("wild_turkey_" . $player_id, $dice_info);
    }

    public static function getWorkerPlacement(int $player_id) {
        return self::get("locations_" . $player_id);
    }

    public static function setWorkerPlacement(int $player_id, array $locations_id) {
        self::set("locations_" . $player_id, $locations_id);
    }

    public static function getComfortResource(int $card_id) {
        return self::get("comforts_" . $card_id, true) ?? [];
    }

    public static function setComfortResource(int $card_id, array $resources) {
        self::set("comforts_" . $card_id, $resources);
    }

    public static function getComfortResourceByCard() {
        $lines = self::getCollectionFromDB("SELECT SUBSTRING(`name`, 10, 3) card_id, `value` FROM `global_variables` where `name` like 'comforts_%'");
        $result = [];
        foreach($lines as $line) {
            $result[intval($line['card_id'])] = json_decode($line['value'], true);
        }
        return $result;
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
