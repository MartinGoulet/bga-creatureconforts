<?php

namespace CreatureConforts\Cards\Travelers;

use BgaUserException;
use CreatureConforts\Core\Game;
use CreatureConforts\Core\Notifications;
use CreatureConforts\Managers\Conforts;
use CreatureConforts\Managers\Players;

class WildTurkey {
    static function resolve(int $die_value, array $resources, array $group) {
        if ($die_value <= 1) {
            self::resolve_first();
        } else if ($die_value <= 3) {
            self::resolve_second();
        } else {
            self::resolve_third($resources, $group);
        }
    }
    static function resolve_first() {
        $player_id = Players::getPlayerId();
        $card = Conforts::draw($player_id);
        Game::undoSavepoint(); // For drawing

        Players::addResources($player_id, [STORY => 1]);

        Notifications::drawConfort($player_id, [$card]);
        Notifications::travelerReceivedResources([STORY => 1]);
    }
    static function resolve_second() {
        $player_id = Players::getPlayerId();
        $resources = [MUSHROOM => 1, GRAIN => 1, FRUIT => 1];
        Players::addResources($player_id, $resources);
        Notifications::travelerReceivedResources($resources);
    }
    static function resolve_third(array $resources, array $group) {
        throw new BgaUserException("Not implemented yet");
        // if (sizeof($resources) > 6) {
        //     throw new BgaUserException('Too many resources');
        // }
        // if (!ResourcesHelper::isGroupLimitedTo($group, [FRUIT, MUSHROOM])) {
        //     throw new BgaUserException("Wrong type of resource");
        // }
        // if ($group[FRUIT] !== $group[MUSHROOM]) {
        //     throw new BgaUserException("Fruit and mushroom count must match");
        // }
        // Players::removeResource(Players::getPlayerId(), $group);
        // Players::addResources(Players::getPlayerId(), [STORY => $group[FRUIT]]);
        // Notifications::travelerExchangeResources($group, [STORY => $group[FRUIT]]);
    }
}
