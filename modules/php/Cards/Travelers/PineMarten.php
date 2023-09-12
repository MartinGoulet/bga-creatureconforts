<?php

namespace CreatureConforts\Cards\Travelers;

use BgaUserException;
use CreatureConforts\Core\Notifications;
use CreatureConforts\Helpers\ResourcesHelper;
use CreatureConforts\Managers\Players;

class PineMarten {
    static function resolve(int $die_value, array $resources, array $group) {
        if ($die_value <= 3) {
            self::resolve_first($resources, $group);
        } else if ($die_value <= 5) {
            self::resolve_second($resources, $group);
        } else {
            self::resolve_third($resources, $group);
        }
    }
    static function resolve_first(array $resources, array $group) {
        if (sizeof($resources) > 5) {
            throw new BgaUserException('Too many resources');
        }
        Players::removeResource(Players::getPlayerId(), $group);
        Players::addResources(Players::getPlayerId(), [WOOD => sizeof($resources)]);
        Notifications::travelerExchangeResources($group, [WOOD => sizeof($resources)]);
    }
    static function resolve_second(array $resources, array $group) {
        if (sizeof($resources) > 3) {
            throw new BgaUserException('Too many resources');
        }
        if (!ResourcesHelper::isGroupLimitedTo($group, [LESSON_LEARNED])) {
            throw new BgaUserException("Wrong type of resource");
        }
        Players::removeResource(Players::getPlayerId(), $group);
        Players::addResources(Players::getPlayerId(), [COIN => sizeof($resources)]);
        Notifications::travelerExchangeResources($group, [COIN => sizeof($resources)]);
    }
    static function resolve_third(array $resources, array $group) {
        if (sizeof($resources) > 6) {
            throw new BgaUserException('Too many resources');
        }
        if (!ResourcesHelper::isGroupLimitedTo($group, [FRUIT, MUSHROOM])) {
            throw new BgaUserException("Wrong type of resource");
        }
        if ($group[FRUIT] !== $group[MUSHROOM]) {
            throw new BgaUserException("Fruit and mushroom count must match");
        }
        Players::removeResource(Players::getPlayerId(), $group);
        Players::addResources(Players::getPlayerId(), [STORY => $group[FRUIT]]);
        Notifications::travelerExchangeResources($group, [STORY => $group[FRUIT]]);
    }
}