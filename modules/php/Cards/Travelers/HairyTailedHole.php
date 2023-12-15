<?php

namespace CreatureComforts\Cards\Travelers;

use BgaSystemException;
use BgaUserException;
use CreatureComforts\Core\Notifications;
use CreatureComforts\Helpers\ResourcesHelper;
use CreatureComforts\Managers\Players;

class HairyTailedHole {
    static function resolve(int $die_value, array $resources, array $group, array $resource_get) {
        if ($die_value <= 3) {
            self::resolve_first($die_value, $resources, $group, $resource_get);
        } else {
            self::resolve_second($resources, $group);
        }
    }
    static function resolve_first(int $die_value, array $resources, array $group, array $resource_get) {
        if (!ResourcesHelper::isGroupLimitedTo($group, [STONE, COIN])) {
            throw new BgaUserException("Wrong type of resource");
        }
        if (sizeof($resources) > $die_value) {
            throw new BgaUserException('Wrong number of resource "from"');
        }
        if (sizeof($resource_get) > $die_value) {
            throw new BgaUserException('Wrong number of resource "to"');
        }
        if (sizeof($resources) !== sizeof($resource_get)) {
            throw new BgaUserException('Must have the same number of resource');
        }
        Players::removeResource(Players::getPlayerId(), $group);
        $group_get = ResourcesHelper::groupByType($resource_get);
        Players::addResources(Players::getPlayerId(), $group_get);
        Notifications::travelerExchangeResources($group, $group_get);
        
    }
    static function resolve_second(array $resources, array $group) {
        if (sizeof($resources) % 2 !== 0) {
            throw new BgaUserException('Wrong number of resource');
        }
        if (!ResourcesHelper::isGroupLimitedTo($group, [STONE, COIN])) {
            throw new BgaUserException("Wrong type of resource");
        }
        Players::removeResource(Players::getPlayerId(), $group);
        Players::addResources(Players::getPlayerId(), [STORY => sizeof($resources) / 2]);
        Notifications::travelerExchangeResources($group, [STORY => sizeof($resources) / 2]);
    }
}