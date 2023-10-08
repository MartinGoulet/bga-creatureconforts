<?php

namespace CreatureConforts\Cards\Travelers;

use BgaUserException;
use CreatureConforts\Core\Notifications;
use CreatureConforts\Helpers\ResourcesHelper;
use CreatureConforts\Managers\Players;

class AmericanBeaver {
    static function resolve(int $die_value, array $resource, array $group) {
        if ($die_value <= 3) {
            self::resolve_first($die_value, $resource, $group);
        } else {
            self::resolve_second($resource, $group);
        }
    }
    static function resolve_first(int $die_value, array $resource, array $group) {
        if (!ResourcesHelper::isGroupLimitedTo($group, [WOOD])) {
            throw new BgaUserException("Wrong type of resource");
        }
        if ($group[WOOD] > $die_value) {
            throw new BgaUserException('Too many resources');
        }
        $player_id = Players::getPlayerId();
        Players::removeResource($player_id, $group);
        Players::addResources($player_id, [COIN => $group[COIN]]);
        Notifications::travelerExchangeResources($group, [COIN => $group[COIN]]);
    }
    static function resolve_second(array $resource, array $group) {
        if (sizeof($resource) > 6) {
            throw new BgaUserException('Too many resources');
        }
        if (sizeof($resource) % 2 !== 0) {
            throw new BgaUserException('Must have even number of resources');
        }
        if ($group[WOOD] < sizeof($resource) / 2) {
            throw new BgaUserException('Not enough wood');
        }
        $player_id = Players::getPlayerId();
        Players::removeResource($player_id, $group);
        Players::addResources($player_id, [STORY => (sizeof($resource) / 2)]);
        Notifications::travelerExchangeResources($group, [STORY => (sizeof($resource) / 2)]);
    }
}
