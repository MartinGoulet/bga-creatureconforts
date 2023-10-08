<?php

namespace CreatureConforts\Cards\Travelers;

use BgaUserException;
use CreatureConforts\Core\Notifications;
use CreatureConforts\Helpers\ResourcesHelper;
use CreatureConforts\Managers\Players;

class CommonLoon {
    static function resolve(int $die_value, array $resource, array $group, array $resource2, array $group2) {
        if ($die_value <= 2) {
            self::resolve_first();
        } else {
            self::resolve_second($die_value, $resource, $group, $resource2, $group2);
        }
    }
    static function resolve_first() {
        Players::addResources(Players::getPlayerId(), [LESSON_LEARNED => 2]);
        Notifications::travelerReceivedResources([LESSON_LEARNED => 2]);
    }
    static function resolve_second(int $die_value,array $resource, array $group, array $resource2, array $group2) {
        if (sizeof($resource) !== sizeof($resource2)) {
            throw new BgaUserException('Resource must be the same number');
        }
        if (sizeof($resource) > $die_value || sizeof($resource2) > $die_value) {
            throw new BgaUserException('Too many resources');
        }
        $unique_resource = array_unique($resource);
        $unique_resource2 = array_unique($resource2);
        if (sizeof($resource) == sizeof($unique_resource)) {
            throw new BgaUserException('All goods must be different');
        }
        if (sizeof($resource2) == sizeof($unique_resource2)) {
            throw new BgaUserException('All goods must be the same');
        }
        $player_id = Players::getPlayerId();
        Players::removeResource($player_id, $group);
        Players::addResources($player_id, $group2);
        Notifications::travelerExchangeResources($group, $group2);
    }
}
