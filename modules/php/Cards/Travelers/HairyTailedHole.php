<?php

namespace CreatureConforts\Cards\Travelers;

use BgaSystemException;
use BgaUserException;
use CreatureConforts\Core\Notifications;
use CreatureConforts\Helpers\ResourcesHelper;
use CreatureConforts\Managers\Players;

class HairyTailedHole {
    static function resolve(int $die_value, array $resources, array $group, array $resource_get) {
        if ($die_value <= 3) {
            self::resolve_first($resources, $group, $resource_get);
        } else {
            self::resolve_second($resources, $group);
        }
    }
    static function resolve_first(array $resources, array $group, array $resource_get) {
        if (!ResourcesHelper::isGroupLimitedTo($group, [STONE])) {
            throw new BgaUserException("Wrong type of resource");
        }
        if (sizeof($resources) !== 1) {
            throw new BgaUserException('Wrong number of resource "from"');
        }
        if (sizeof($resource_get) !== 1) {
            throw new BgaUserException('Wrong number of resource "to"');
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
        if (!ResourcesHelper::isGroupLimitedTo($group, [STONE])) {
            throw new BgaUserException("Wrong type of resource");
        }
        Players::removeResource(Players::getPlayerId(), $group);
        Players::addResources(Players::getPlayerId(), [STORY => $group[STONE] / 2]);
        Notifications::travelerExchangeResources($group, [STORY => $group[STONE] / 2]);
    }
}