<?php

namespace CreatureComforts\Cards\Travelers;

use BgaUserException;
use CreatureComforts\Core\Notifications;
use CreatureComforts\Helpers\ResourcesHelper;
use CreatureComforts\Managers\Players;

class GrayWolf {
    static function resolve(int $die_value, array $resources, array $group) {
        if ($die_value <= 2) {
            self::resolve_first($resources, $group);
        } else if ($die_value <= 5) {
            self::resolve_second();
        } else {
            self::resolve_third($resources, $group);
        }
    }
    static function resolve_first(array $resources, array $group) {
        if (!ResourcesHelper::isGroupLimitedTo($group, [COIN])) {
            throw new BgaUserException("Wrong type of resource");
        }
        if ($group[COIN] > 1) {
            throw new BgaUserException('Too many resources');
        }
        $player_id = Players::getPlayerId();

        Players::removeResource($player_id, $group);
        Players::addResources($player_id, [LESSON_LEARNED => 2]);
        Notifications::travelerExchangeResources($group, [LESSON_LEARNED => 2]);
    }
    static function resolve_second() {
        Players::addResources(Players::getPlayerId(), [COIN => 1]);
        Notifications::travelerReceivedResources([COIN => 1]);
    }
    static function resolve_third(array $resources, array $group) {
        if (!ResourcesHelper::isGroupLimitedTo($group, [LESSON_LEARNED])) {
            throw new BgaUserException("Wrong type of resource");
        }
        if ($group[LESSON_LEARNED] > 2) {
            throw new BgaUserException('Too many resources');
        }
        $player_id = Players::getPlayerId();
        Players::removeResource($player_id, $group);
        Players::addResources($player_id, [STORY => $group[LESSON_LEARNED]]);
        Notifications::travelerExchangeResources($group, [STORY => $group[LESSON_LEARNED]]);
    }
}
