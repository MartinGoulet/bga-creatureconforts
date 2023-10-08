<?php

namespace CreatureConforts\Cards\Travelers;

use BgaUserException;
use CreatureConforts\Core\Notifications;
use CreatureConforts\Helpers\ResourcesHelper;
use CreatureConforts\Managers\Players;

class Moose {
    static function resolve(int $die_value, array $resource, array $group, array $resource2, array $group2) {
        if ($die_value <= 2) {
            self::resolve_first($resource, $group, $resource2, $group2);
        } else if ($die_value <= 3) {
            self::resolve_second();
        } else {
            self::resolve_third($die_value, $resource, $group, $resource2, $group2);
        }
    }
    static function resolve_first(array $resources, array $group, array $resource2, $group2) {
        if (!ResourcesHelper::isGroupLimitedTo($group, [COIN])) {
            throw new BgaUserException("Wrong type of resource");
        }
        if ($group[COIN] > 2) {
            throw new BgaUserException('Too many resources');
        }
        if (sizeof($resource2) % 2 !== 0 || sizeof($resource2) / 2 !== $group[COIN]) {
            throw new BgaUserException('Not the right amount of resource to get');
        }
        foreach ($group2 as $icon => $count) {
            if ($count > $group[COIN]) {
                throw new BgaUserException("Resources must be different");
            }
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

    static function resolve_third(int $die_value, array $resource, array $group) {
        if (sizeof($resource) > 4) {
            throw new BgaUserException('Too many resources');
        }
        $unique_resource = array_unique($resource);
        $isValid = 
            (sizeof($resource) == 2 && sizeof($unique_resource) == 1) ||
            (sizeof($resource) == 4 && sizeof($unique_resource) == 2);

        if(!$isValid) {
            throw new BgaUserException("Resource must be equals");
        }
        $player_id = Players::getPlayerId();
        Players::removeResource($player_id, $group);
        Players::addResources($player_id, [STORY => sizeof($resource) / 2]);
        Notifications::travelerExchangeResources($group, [STORY => sizeof($resource) / 2]);
    }
}
