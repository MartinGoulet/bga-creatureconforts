<?php

namespace CreatureConforts\Cards\Travelers;

use BgaSystemException;
use BgaUserException;
use CreatureConforts\Core\Notifications;
use CreatureConforts\Helpers\ResourcesHelper;
use CreatureConforts\Managers\Players;

class CanadaLynx {
    static function resolve(int $die_value, array $resources, array $group) {
        if ($die_value <= 4) {
            self::resolve_first($resources, $group);
        } else {
            self::resolve_second();
        }
    }
    static function resolve_first(array $resources, array $group) {
        if (sizeof($resources) % 2 !== 0) {
            throw new BgaUserException("Must be even number of resources");
        }

        $max = sizeof($resources) / 2;
        foreach ($group as $icon => $count) {
            if ($count > $max) {
                throw new BgaUserException("Resources must be different");
            }
        }

        $player_id = Players::getPlayerId();
        Players::removeResource($player_id, $group);
        Players::addResources($player_id, [COIN => $max]);
        Notifications::travelerExchangeResources($group, [COIN => $max]);
    }
    static function resolve_second() {
        Players::addResources(Players::getPlayerId(), [STORY => 1]);
        Notifications::travelerReceivedResources([STORY => 1]);
    }
}
