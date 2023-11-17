<?php

namespace CreatureConforts\Traits;

use CreatureConforts\Core\Game;
use CreatureConforts\Core\Globals;
use CreatureConforts\Managers\Conforts;
use CreatureConforts\Managers\Dice;
use CreatureConforts\Managers\Players;

trait Args {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Game state arguments
    ////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    function argStartHandDiscard() {
        $players = Game::get()->loadPlayersBasicInfos();
        $args = ["_private" => []];

        foreach ($players as $player_id => $player) {
            $cards = Conforts::getHand($player_id);
            $selection = array_values(array_filter($cards, function ($card) {
                return $card['location'] == 'selection';
            }));
            if (sizeof($selection) == 1) {
                $args["_private"][$player_id] = [
                    "card_id" => intval($selection[0]['id']),
                ];
            }
        }

        return $args;
    }

    function argPlacement() {
        $players = Game::get()->loadPlayersBasicInfos();
        $args = ["_private" => []];

        foreach ($players as $player_id => $player) {
            $locations = Globals::getWorkerPlacement($player_id);
            $args["_private"][$player_id] = [
                "locations" => $locations,
            ];
        }

        return $args;
    }

    function argPlayerTurnResolve() {
        $player_id = Players::getPlayerId();
        $player_dice = Dice::getDiceFromPlayer($player_id);
        $white_dice = Dice::getWhiteDice();
        $dice = array_merge($player_dice, $white_dice);
        $locations = array_unique(array_map(function ($die) {
            return intval($die['location']);
        }, $dice));
        $locations = array_filter($locations, function ($location) {
            return $location > 0;
        });

        return [
            'locations' => array_values($locations),
        ];
    }

    function argPlayerTurnDiscard() {
        return [
            'nbr' => sizeof(Conforts::getHand(Players::getPlayerId())) - 3,
        ];
    }
}
