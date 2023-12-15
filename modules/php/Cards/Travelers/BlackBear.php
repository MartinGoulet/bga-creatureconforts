<?php

namespace CreatureComforts\Cards\Travelers;

use BgaUserException;
use CreatureComforts\Core\Notifications;
use CreatureComforts\Helpers\ResourcesHelper;
use CreatureComforts\Managers\Players;

class BlackBear {
    static function resolve(int $die_value, array $resource, array $group, array $resource2, array $group2) {
        if ($die_value <= 3) {
            self::resolve_first($die_value, $resource, $group, $resource2, $group2);
        } else if ($die_value <= 5) {
            self::resolve_second();
        } else {
            self::resolve_third($group);
        }
    }
    static function resolve_first(int $die_value, array $resource, array $group, array $resource2, array $group2) {
        if (!ResourcesHelper::isGroupLimitedTo($group, [FRUIT])) {
            throw new BgaUserException("Wrong type of resource");
        }
        if ($group[FRUIT] > $die_value) {
            throw new BgaUserException('Too many resources');
        }
        if (sizeof($resource) !== sizeof($resource2)) {
            throw new BgaUserException("Not the same number of resource");
        }
        $player_id = Players::getPlayerId();
        Players::removeResource($player_id, $group);
        Players::addResources($player_id, $group2);
        Notifications::travelerExchangeResources($group, $group2);
    }
    static function resolve_second() {
        Players::addResources(Players::getPlayerId(), [STORY => 1]);
        Notifications::travelerReceivedResources([STORY => 1]);
    }
    static function resolve_third(array $group) {
        if (!ResourcesHelper::isGroupLimitedTo($group, [FRUIT])) {
            throw new BgaUserException("Wrong type of resource");
        }
        if ($group[FRUIT] > 3) {
            throw new BgaUserException('Too many resources');
        }
        $player_id = Players::getPlayerId();
        Players::removeResource($player_id, $group);
        Players::addResources($player_id, [COIN => $group[FRUIT]]);
        Notifications::travelerExchangeResources($group, [COIN => $group[FRUIT]]);
    }
}
