<?php

namespace CreatureConforts\Helpers;

use BgaUserException;
use CreatureConforts\Core\Game;
use CreatureConforts\Core\Notifications;
use CreatureConforts\Managers\Cottages;
use CreatureConforts\Managers\Dice;
use CreatureConforts\Managers\Improvements;
use CreatureConforts\Managers\Players;
use CreatureConforts\Managers\Worker;

class ImprovementHelper {

    static function resolve(int $location_id) {
        $improvement = array_filter(Improvements::getGlade(), function ($card) use ($location_id) {
            return intval($card['location_arg']) === $location_id;
        })[0];
        $owner_id = Cottages::getOwner($improvement);

        switch (intval($improvement['type'])) {
            case 7: // Guest Cottage [STORY, ANY]
                throw new BgaUserException("Not implemented yet");
                break;
            case 8: // Orchard
                self::playerGetResources($location_id, $owner_id, FRUIT);
                Game::get()->gamestate->nextState("next");
                break;
            case 14: // Wildwood
                self::playerGetResources($location_id, $owner_id, MUSHROOM);
                Game::get()->gamestate->nextState("next");
                break;
            case 16: // Field
                self::playerGetResources($location_id, $owner_id, GRAIN);
                Game::get()->gamestate->nextState("next");
                break;
            default:
                throw new BgaUserException("Improvement not implemented");
        }
    }

    private static function playerGetResources(int $location_id, int $owner_id, string $resource) {
        Players::addResources(Players::getPlayerId(), [$resource => 2]);
        Notifications::getResourcesFromLocation(Players::getPlayerId(), $location_id, [$resource => 2]);
        if($owner_id !== Players::getPlayerId()) {
            Players::addResources($owner_id , [$resource => 1]);
            Notifications::getResourcesFromLocation($owner_id , $location_id, [$resource => 1]);
        }
        self::returnFamilyDice($location_id);
    }

    private static function returnFamilyDice(int $location_id) {
        $dice = Dice::getDiceInLocation($location_id);
        $die = array_shift($dice);
        Dice::moveFamilyDieToBoard(Players::getPlayerId(), intval($die['id']));
        $die = Dice::get($die['id']);
        Notifications::returnFamilyDie(Players::getPlayerId(), $die);
    }
}
