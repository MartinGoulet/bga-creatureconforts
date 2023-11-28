<?php

namespace CreatureConforts\Helpers;

use BgaUserException;
use CreatureConforts\Cards\Travelers\AmericanBeaver;
use CreatureConforts\Cards\Travelers\BlackBear;
use CreatureConforts\Cards\Travelers\BlueJay;
use CreatureConforts\Cards\Travelers\CanadaLynx;
use CreatureConforts\Cards\Travelers\CommonLoon;
use CreatureConforts\Cards\Travelers\CommonRaven;
use CreatureConforts\Cards\Travelers\GrayWolf;
use CreatureConforts\Cards\Travelers\HairyTailedHole;
use CreatureConforts\Cards\Travelers\LeopardFrog;
use CreatureConforts\Cards\Travelers\Moose;
use CreatureConforts\Cards\Travelers\PileatedWoodpecker;
use CreatureConforts\Cards\Travelers\PineMarten;
use CreatureConforts\Cards\Travelers\SnappingTurtle;
use CreatureConforts\Cards\Travelers\StripedSkunk;
use CreatureConforts\Cards\Travelers\WildTurkey;
use CreatureConforts\Managers\Players;
use CreatureConforts\Managers\Travelers;

class TravelerHelper {

    static function resolve($die, $resources, $resources_get, $card_ids) {
        $traveler_type = Travelers::getTopCard()['type'];
        $group = ResourcesHelper::groupByType($resources);
        if (!Players::hasEnoughResource(Players::getPlayerId(), $group)) {
            throw new BgaUserException("You dont have those resources");
        }

        switch ($traveler_type) {
            case 1:
                CanadaLynx::resolve($die['face'], $resources, $group);
                break;
            case 2:
                $group2 = ResourcesHelper::groupByType($resources_get);
                LeopardFrog::resolve($die['face'], $resources, $group, $resources_get, $group2);
                break;
            case 3:
                PileatedWoodpecker::resolve($die['face'], $resources, $group);
                break;
            case 4:
                GrayWolf::resolve($die['face'], $resources, $group);
                break;
            case 5:
                HairyTailedHole::resolve($die['face'], $resources, $group, $resources_get);
                break;
            case 6:
                CommonRaven::resolve($die['face'], $resources, $group);
                break;
            case 7:
                $group2 = ResourcesHelper::groupByType($resources_get);
                StripedSkunk::resolve($die['face'], $resources, $group, $resources_get, $group2, $card_ids);
                break;
            case 8:
                AmericanBeaver::resolve($die['face'], $resources, $group);
                break;
            case 9:
                $group2 = ResourcesHelper::groupByType($resources_get);
                CommonLoon::resolve($die['face'], $resources, $group, $resources_get, $group2);
                break;
            case 10:
                $group2 = ResourcesHelper::groupByType($resources_get);
                SnappingTurtle::resolve($die['face'], $resources, $group, $resources_get, $group2);
                break;
            case 11:
                PineMarten::resolve($die['face'], $resources, $group);
                break;
            case 12:
                $group2 = ResourcesHelper::groupByType($resources_get);
                BlackBear::resolve($die['face'], $resources, $group, $resources_get, $group2);
                break;
            case 13:
                $group2 = ResourcesHelper::groupByType($resources_get);
                Moose::resolve($die['face'], $resources, $group, $resources_get, $group2);
                break;
            case 14:
                BlueJay::resolve($die['face'], $group);
                break;
            case 15:
                $group2 = ResourcesHelper::groupByType($resources_get);
                WildTurkey::resolve($die['face'], $resources, $group, $resources_get, $group2);
                break;
            default:
                throw new BgaUserException("Traveler not found");
        }
    }

    static function isActiveCanadaLynx() {
        return self::isTravelerActive(1);
    }

    static function isActiveLeopardFrog() {
        return self::isTravelerActive(2);
    }

    static function isActivePileatedWoodpecker() {
        return self::isTravelerActive(3);
    }

    static function isActiveGrayWolf() {
        return self::isTravelerActive(4);
    }

    static function isActiveHairyTailedHole() {
        return self::isTravelerActive(5);
    }

    static function isActiveCommonRaven() {
        return self::isTravelerActive(6);
    }

    static function isActiveStripedSkunk() {
        return self::isTravelerActive(7);
    }

    static function isActiveAmericanBeaver() {
        return self::isTravelerActive(8);
    }

    static function isActiveCommonLoon() {
        return self::isTravelerActive(9);
    }

    static function isActivePineMarten() {
        return self::isTravelerActive(11);
    }

    static function isActiveBlackBear() {
        return self::isTravelerActive(12);
    }

    static function isActiveWildTurkey() {
        return self::isTravelerActive(15);
    }

    private static function isTravelerActive(int $type) {
        $traveler_type = Travelers::getTopCard()['type'];
        return $traveler_type == $type;
    }
}
