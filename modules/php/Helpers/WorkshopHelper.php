<?php

namespace CreatureConforts\Helpers;

use BgaUserException;
use CreatureConforts\Core\Notifications;
use CreatureConforts\Managers\Cottages;
use CreatureConforts\Managers\Improvements;
use CreatureConforts\Managers\Players;

class WorkshopHelper {

    static function resolve(int $die_value, int $position) {

        if ($position > $die_value) {
            throw new BgaUserException("You cannot take a position higher than " . $die_value);
        }

        $player_id = Players::getPlayerId();
        $card = Improvements::getFromLadder($position);
        $card_type = Improvements::getCardType($card);

        if (!Players::hasEnoughResource(Players::getPlayerId(), $card_type['cost'])) {
            throw new BgaUserException("You dont have those resources");
        }

        Players::removeResource($player_id, $card_type['cost']);

        if ($card_type['glade'] == true) {
            Improvements::addToGlade($card, $player_id);
        } else {
            Improvements::addToPlayerBoard($card, $player_id);
        }
        $cottage = Cottages::addToImprovement($card['id'], $player_id);
        Notifications::buildImprovement($player_id, Improvements::get($card['id']), $card_type['cost'], $cottage);


        switch ($card['type']) {
            case 10: // Almanac
                Players::addResources($player_id, ['almanac' => 1]);
                Notifications::addAlmanac($player_id);
                break;
            case 11: // Wheelbarrow
                Players::addResources($player_id, ['wheelbarrow' => 1]);
                Notifications::addWheelbarrow($player_id);
                break;
        }

        Improvements::refillLadder();
        Notifications::refillLadder(Improvements::getLadder());
    }
}
