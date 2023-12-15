<?php

namespace CreatureComforts\Cards\Travelers;

use BgaUserException;
use CreatureComforts\Core\Game;
use CreatureComforts\Core\Notifications;
use CreatureComforts\Managers\Comforts;
use CreatureComforts\Managers\Players;

class WildTurkey {
    static function resolve(int $die_value, array $resources, array $group, array $resources2, array $group2) {
        if ($die_value <= 1) {
            self::resolve_first();
        } else if ($die_value <= 3) {
            self::resolve_second();
        } else {
            self::resolve_third($resources, $group, $resources2, $group2);
        }
    }
    static function resolve_first() {
        $player_id = Players::getPlayerId();
        
        Players::addResources($player_id, [STORY => 1]);
        Notifications::travelerReceivedResources([CARD => 1, STORY => 1]);
        
        Game::undoSavepoint(); // For drawing
        $card = Comforts::draw($player_id);
        Notifications::drawConfort($player_id, [$card]);
    }
    static function resolve_second() {
        $player_id = Players::getPlayerId();
        $resources = [MUSHROOM => 1, GRAIN => 1, FRUIT => 1];
        Players::addResources($player_id, $resources);
        Notifications::travelerReceivedResources($resources);
    }
    static function resolve_third(array $resources, array $group, array $resources2, array $group2) {
        if(sizeof($resources) !== sizeof($resources2)) {
            throw new BgaUserException("Must have the same number of resource");
        }
        Players::removeResource(Players::getPlayerId(), $group);
        Players::addResources(Players::getPlayerId(), $group2);
        Notifications::travelerExchangeResources($group, $group2);
    }
}
