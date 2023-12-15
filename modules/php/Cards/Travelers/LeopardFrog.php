<?php

namespace CreatureComforts\Cards\Travelers;

use BgaUserException;
use CreatureComforts\Core\Notifications;
use CreatureComforts\Helpers\ResourcesHelper;
use CreatureComforts\Managers\Players;

class LeopardFrog {
    static function resolve(int $die_value, array $resources, array $group, array $resources2, array $groupe2) {
        if (!ResourcesHelper::isGroupLimitedTo($group, [MUSHROOM])) {
            throw new BgaUserException("Wrong type of resource");
        }
        if ($group[MUSHROOM] > $die_value) {
            throw new BgaUserException('Too many resources');
        }

        $player_id = Players::getPlayerId();
        Players::removeResource($player_id, $group);
        Players::addResources($player_id, $groupe2);
        Notifications::travelerExchangeResources($group, $groupe2);
    }
}
