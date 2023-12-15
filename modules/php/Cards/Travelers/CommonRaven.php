<?php

namespace CreatureComforts\Cards\Travelers;

use BgaUserException;
use CreatureComforts\Core\Notifications;
use CreatureComforts\Helpers\ResourcesHelper;
use CreatureComforts\Managers\Comforts;
use CreatureComforts\Managers\Players;

class CommonRaven {
    static function resolve(int $die_value, array $resources, array $group) {
        if ($die_value <= 2) {
            self::resolve_first($resources, $group);
        } else if ($die_value <= 3) {
            self::resolve_second($resources, $group);
        } else {
            self::resolve_third($resources, $group);
        }
    }
    static function resolve_first(array $resources, array $group) {
        if (!ResourcesHelper::isGroupLimitedTo($group, [COIN])) {
            throw new BgaUserException("Wrong type of resource");
        }
        if ($group[COIN] > 2) {
            throw new BgaUserException('Too many resources');
        }
        $player_id = Players::getPlayerId();
        Players::removeResource($player_id, $group);
        Players::addResources($player_id, [STORY => $group[COIN]]);
        Notifications::travelerExchangeResources($group, [STORY => $group[COIN]]);
    }
    static function resolve_second(array $resources, array $group) {
        if (!ResourcesHelper::isGroupLimitedTo($group, [COIN])) {
            throw new BgaUserException("Wrong type of resource");
        }
        if ($group[COIN] > 1) {
            throw new BgaUserException('Too many resources');
        }
        $player_id = Players::getPlayerId();
        Players::removeResource($player_id, $group);
        Players::addResources($player_id, [LESSON_LEARNED => 1]);
        Notifications::travelerExchangeResources($group, [CARD => 1, LESSON_LEARNED => 1]);
        $card = Comforts::draw($player_id);
        Notifications::drawConfort($player_id, [$card]);
    }
    static function resolve_third(array $resources, array $group) {
        if (!ResourcesHelper::isGroupLimitedTo($group, [GRAIN])) {
            throw new BgaUserException("Wrong type of resource");
        }
        if ($group[GRAIN] > 3) {
            throw new BgaUserException('Too many resources');
        }
        $player_id = Players::getPlayerId();
        Players::removeResource($player_id, $group);
        Players::addResources($player_id, [COIN => $group[GRAIN]]);
        Notifications::travelerExchangeResources($group, [LESSON_LEARNED => $group[GRAIN]]);
    }
}
