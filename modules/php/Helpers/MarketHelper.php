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

        if (sizeof($resources) == 1 && in_array(COIN, $resources) && sizeof($resources2) == 1) {
            // Option 1 : Coin => Good
            if (!sizeof($resources2) == 1) {
                throw new BgaUserException("You must select only 1 resource");
            }
            self::doTransaction($player_id, $group, $group2);
            return;
        }

        if (sizeof($resources) == 2 && sizeof($resources2) == 1) {
            // Option 2 : 2 identical goods => 1 good
            if (sizeof($group) != 1) {
                throw new BgaUserException("Goods must be identical");
            }
            self::doTransaction($player_id, $group, $group2);
            return;
        }

        if (sizeof($resources) == 3 && sizeof($resources2) == 1 && in_array(COIN, $resources2)) {
            // Option 3 : 3 goods => 1 coin
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
