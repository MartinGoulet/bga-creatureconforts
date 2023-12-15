<?php

namespace CreatureComforts\Helpers;

use BgaUserException;
use CreatureComforts\Core\Globals;
use CreatureComforts\Core\Notifications;
use CreatureComforts\Managers\Improvements;
use CreatureComforts\Managers\Players;

class MarketHelper {

    static function resolve($resources, $resources2, $option) {

        if($option == 2) {
            Globals::setMarketUsed(false);
            Globals::setScaleUsed(false);
            return;
        }

        $player_id = Players::getPlayerId();
        $group = ResourcesHelper::groupByType($resources);
        $group2 = ResourcesHelper::groupByType($resources2);

        if (!Players::hasEnoughResource($player_id, $group)) {
            var_dump($group);
            throw new BgaUserException("You dont have those resources");
        }

        // Scale
        if ($option == 1) {
            if(!Improvements::hasScale($player_id)) {
                throw new BgaUserException("You dont have a scale");
            }
            self::doTransaction($player_id, $group, $group2);
            Globals::setScaleUsed(true);
            return;
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
