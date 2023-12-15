<?php

namespace CreatureComforts\Cards\Travelers;

use BgaUserException;
use CreatureComforts\Core\Notifications;
use CreatureComforts\Helpers\ResourcesHelper;
use CreatureComforts\Managers\Players;

class PileatedWoodpecker {
    static function resolve(int $die_value, array $resources, array $group) {
        if ($die_value <= 2) {
            self::resolve_first($resources, $group);
        } else if ($die_value <= 4) {
            self::resolve_second($resources, $group);
        } else {
            self::resolve_third($resources, $group);
        }
    }
    static function resolve_first(array $resources, array $group) {
        if (!ResourcesHelper::isGroupLimitedTo($group, [GRAIN])) {
            throw new BgaUserException("Wrong type of resource");
        }
        if ($group[GRAIN] > 2) {
            throw new BgaUserException('Too many resources');
        }
        $player_id = Players::getPlayerId();
        Players::removeResource($player_id, $group);
        Players::addResources($player_id, [YARN => $group[GRAIN] * 2]);
        Notifications::travelerExchangeResources($group, [YARN => $group[GRAIN] * 2]);
    }
    static function resolve_second(array $resources, array $group) {
        if (!ResourcesHelper::isGroupLimitedTo($group, [YARN])) {
            throw new BgaUserException("Wrong type of resource");
        }
        if ($group[YARN] > 2) {
            throw new BgaUserException('Too many resources');
        }
        $player_id = Players::getPlayerId();
        Players::removeResource($player_id, $group);
        Players::addResources($player_id, [MUSHROOM => $group[YARN] * 2]);
        Notifications::travelerExchangeResources($group, [MUSHROOM => $group[YARN] * 2]);
    }
    static function resolve_third(array $resources, array $group) {
        if (!ResourcesHelper::isGroupLimitedTo($group, [MUSHROOM])) {
            throw new BgaUserException("Wrong type of resource");
        }
        if ($group[MUSHROOM] > 2) {
            throw new BgaUserException('Too many resources');
        }
        $player_id = Players::getPlayerId();
        Players::removeResource($player_id, $group);
        Players::addResources($player_id, [GRAIN => $group[MUSHROOM] * 2]);
        Notifications::travelerExchangeResources($group, [GRAIN => $group[MUSHROOM] * 2]);
    }
}
