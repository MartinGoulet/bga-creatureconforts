<?php

namespace CreatureConforts\Cards\Travelers;

use BgaUserException;
use CreatureConforts\Core\Notifications;
use CreatureConforts\Helpers\ResourcesHelper;
use CreatureConforts\Managers\Conforts;
use CreatureConforts\Managers\Players;

class StripedSkunk {
    static function resolve(int $die_value, array $resources, array $group, array $resources2, array $group2) {
        if ($die_value <= 1) {
            self::resolve_first($resources, $group);
        } else if ($die_value <= 5) {
            self::resolve_second($resources, $group, $group2);
        } else {
            self::resolve_third($resources, $group);
        }
    }
    static function resolve_first(array $resources, array $group) {
        Players::addResources(Players::getPlayerId(), [STORY => 1]);
        Notifications::travelerReceivedResources([STORY => 1]);
    }
    static function resolve_second(array $resources, array $group) {
        // TODO Implement when card discard was implemented

        // if (!ResourcesHelper::isGroupLimitedTo($group, [COIN])) {
        //     throw new BgaUserException("Wrong type of resource");
        // }
        // if ($group[COIN] > 1) {
        //     throw new BgaUserException('Too many resources');
        // }
        // $player_id = Players::getPlayerId();
        // Players::removeResource($player_id, $group);
        // Players::addResources($player_id, [LESSON_LEARNED => 1]);
        // Notifications::travelerExchangeResources($group, [LESSON_LEARNED => 1]);
        // $card = Conforts::draw($player_id);
        // Notifications::drawConfort($player_id, [$card]);
    }
    static function resolve_third(array $resources, array $group) {
        // TODO Implement when card discard was implemented

        // if (!ResourcesHelper::isGroupLimitedTo($group, [GRAIN])) {
        //     throw new BgaUserException("Wrong type of resource");
        // }
        // if ($group[GRAIN] > 3) {
        //     throw new BgaUserException('Too many resources');
        // }
        // $player_id = Players::getPlayerId();
        // Players::removeResource($player_id, $group);
        // Players::addResources($player_id, [COIN => $group[GRAIN]]);
        // Notifications::travelerExchangeResources($group, [LESSON_LEARNED => $group[GRAIN]]);
    }
}
