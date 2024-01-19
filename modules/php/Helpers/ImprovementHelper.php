<?php

namespace CreatureComforts\Helpers;

use BgaUserException;
use CreatureComforts\Core\Game;
use CreatureComforts\Core\Notifications;
use CreatureComforts\Managers\Cottages;
use CreatureComforts\Managers\Dice;
use CreatureComforts\Managers\Improvements;
use CreatureComforts\Managers\Players;

class ImprovementHelper {

    static function resolve(int $location_id, array $resource, array $resource2) {
        $improvements = array_filter(Improvements::getGlade(), function ($card) use ($location_id) {
            return intval($card['location_arg']) === $location_id;
        });
        $improvement = array_shift($improvements);
        $owner_id = Cottages::getOwner($improvement);

        switch (intval($improvement['type'])) {
            case 7: // Guest Cottage [STORY, ANY]
                if ($owner_id == Game::get()->getActivePlayerId()) {
                    throw new BgaUserException('You cannot use your Guest Cottage');
                }
                self::guestCottage($location_id, $owner_id, $resource, $resource2);
                break;
            case 8: // Orchard
                self::playerGetResources($location_id, $owner_id, FRUIT);
                break;
            case 14: // Wildwood
                self::playerGetResources($location_id, $owner_id, MUSHROOM);
                break;
            case 16: // Field
                self::playerGetResources($location_id, $owner_id, GRAIN);
                break;
            default:
                throw new BgaUserException("Improvement not implemented");
        }
    }

    private static function guestCottage(int $location_id, int $owner_id, array $resource, array $resource2) {
        $res1 = ResourcesHelper::convertNumberToResource($resource);
        $resource_take = array_shift($res1);
        Players::addResources(Players::getPlayerId(), [STORY => 1, $resource_take => 1]);
        Notifications::getResourcesFromLocation(Players::getPlayerId(), $location_id, [STORY => 1, $resource_take => 1]);

        $res2 = ResourcesHelper::convertNumberToResource($resource2);
        $resource_give = array_shift($res2);
        Players::removeResource(Players::getPlayerId(), [$resource_give => 1]);
        Players::addResources($owner_id, [$resource_give => 1]);
        Notifications::guestCottage(Players::getPlayerId(), $owner_id, [$resource_give => 1]);

        self::returnFamilyDice($location_id);
    }

    private static function playerGetResources(int $location_id, int $owner_id, string $resource) {
        Players::addResources(Players::getPlayerId(), [$resource => 2]);
        Notifications::getResourcesFromLocation(Players::getPlayerId(), $location_id, [$resource => 2]);
        if ($owner_id !== Players::getPlayerId()) {
            Players::addResources($owner_id, [$resource => 1]);
            Notifications::getResourcesFromLocation($owner_id, $location_id, [$resource => 1]);
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
