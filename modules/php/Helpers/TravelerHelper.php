<?php

namespace CreatureConforts\Helpers;

use BgaUserException;
use CreatureConforts\Cards\Travelers\GrayWolf;
use CreatureConforts\Cards\Travelers\PineMarten;
use CreatureConforts\Cards\Travelers\WildTurkey;
use CreatureConforts\Core\Game;
use CreatureConforts\Managers\Players;
use CreatureConforts\Managers\Travelers;

class TravelerHelper {

    static function resolve($die, $resources) {
        $traveler_type = Travelers::getTopCard()['type'];
        $reward = Game::get()->traveler_types[$traveler_type]['reward'][$die['face']];
        $group = ResourcesHelper::groupByType($resources);
        if (!Players::hasEnoughResource(Players::getPlayerId(), $group)) {
            throw new BgaUserException("You dont have those resources");
        }
        switch ($traveler_type) {
            case 4:
                GrayWolf::resolve($die['face'], $resources, $group);
                break;
            case 11:
                PineMarten::resolve($die['face'], $resources, $group);
                break;
            case 15:
                WildTurkey::resolve($die['face'], $resources, $group, $reward);
                break;
            default:
                throw new BgaUserException("Ok");
        }
    }
}


