<?php

namespace CreatureConforts\Helpers;

use BgaUserException;
use CreatureConforts\Core\Notifications;
use CreatureConforts\Managers\Players;

class MarketHelper {

    static function resolve($resources, $resources2) {

        $player_id = Players::getPlayerId();
        $group = ResourcesHelper::groupByType($resources);
        $group2 = ResourcesHelper::groupByType($resources2);

        if (!Players::hasEnoughResource($player_id, $group)) {
            var_dump($group);
            throw new BgaUserException("You dont have those resources");
        }

        // Option 1 : Coin => Good
        if (sizeof($resources) == sizeof($resources2)) {
            $limitedTo = TravelerHelper::isActiveHairyTailedHole() ? [STONE, COIN] : [COIN];
            if (!ResourcesHelper::isGroupLimitedTo($group, $limitedTo)) {
                throw new BgaUserException("Wrong type of resources");
            }
            self::doTransaction($player_id, $group, $group2);
            return;
        }

        // Option 2 : 2 identical goods => 1 good
        if (sizeof($resources) == sizeof($resources2) * 2) {
            foreach ($group as $resource => $value) {
                if ($value % 2 !== 0) {
                    throw new BgaUserException("Must have even number of resources");
                }
            }
            self::doTransaction($player_id, $group, $group2);
            return;
        }

        // Option 3 : 3 goods => 1 coin
        if (sizeof($resources) == sizeof($resources2) * 3) {
            self::doTransaction($player_id, $group, $group2);
            return;
        }

        var_dump($resources);
        var_dump($resources2);
        throw new BgaUserException('Ok');
    }

    private static function doTransaction(int $player_id, array $group, array $group2) {
        Players::removeResource($player_id, $group);
        Players::addResources($player_id, $group2);
        Notifications::marketExchangeResources($group, $group2);
    }
}
