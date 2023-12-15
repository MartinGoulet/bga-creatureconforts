<?php

namespace CreatureComforts\Cards\Travelers;

use BgaUserException;
use CreatureComforts\Core\Notifications;
use CreatureComforts\Helpers\ResourcesHelper;
use CreatureComforts\Managers\Players;

class SnappingTurtle {
    static function resolve(int $die_value, array $resources, array $group, array $resources2, array $group2) {
        if ($die_value <= 3) {
            self::resolve_first($resources, $group, $resources2, $group2);
        } else if ($die_value <= 4) {
            self::resolve_second($resources, $group);
        } else {
            self::resolve_third($resources, $group);
        }
    }
    static function resolve_first(array $resources, array $group, array $resources2, array $group2) {
        if (!ResourcesHelper::isGroupLimitedTo($group, [STORY])) {
            throw new BgaUserException("Wrong type of resource");
        }
        if ($group[STORY] > 1) {
            throw new BgaUserException('Too many resources');
        }
        if (sizeof($resources2) !== 3) {
            throw new BgaUserException('You must select 3 resources');
        }
        $player_id = Players::getPlayerId();
        Players::removeResource($player_id, $group);
        Players::addResources($player_id, $group2);
        Notifications::travelerExchangeResources($group, $group2);
    }
    static function resolve_second(array $resources, array $group) {
        // TODO Implement when card discard was implemented

    }
    static function resolve_third(array $resources, array $group) {
        if (!ResourcesHelper::isGroupLimitedTo($group, [COIN])) {
            throw new BgaUserException("Wrong type of resource");
        }
        if ($group[COIN] > 1) {
            throw new BgaUserException('Too many resources');
        }
        $player_id = Players::getPlayerId();
        Players::removeResource($player_id, $group);
        Players::addResources($player_id, [STORY => 1]);
        Notifications::travelerExchangeResources($group, [STORY => 1]);
    }
}
