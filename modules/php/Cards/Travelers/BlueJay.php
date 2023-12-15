<?php

namespace CreatureComforts\Cards\Travelers;

use BgaUserException;
use CreatureComforts\Core\Notifications;
use CreatureComforts\Helpers\ResourcesHelper;
use CreatureComforts\Managers\Players;

class BlueJay {
    static function resolve(int $die_value, array $group) {
        if ($die_value <= 2) {
            self::resolve_first();
        } else {
            self::resolve_second($group);
        }
    }
    static function resolve_first() {
        Players::addResources(Players::getPlayerId(), [COIN => 2]);
        Notifications::travelerReceivedResources([COIN => 2]);
    }
    static function resolve_second(array $group) {
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
}
