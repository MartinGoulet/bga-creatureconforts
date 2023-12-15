<?php

namespace CreatureComforts\Traits;

use BgaUserException;
use CreatureComforts\Core\Game;
use CreatureComforts\Core\Globals;
use CreatureComforts\Managers\Comforts;
use CreatureComforts\Managers\Dice;
use CreatureComforts\Managers\Improvements;
use CreatureComforts\Managers\Players;
use CreatureComforts\Managers\Worker;

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
            $cards = Comforts::getHand($player_id);
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
            $workers = Worker::getWorkersFromPlayer($player_id);
            $workers_player = array_filter($workers, fn ($w) => $w['location'] === "player");
            $workers_board = array_filter($workers, fn ($w) => $w['location'] === "board");

            $args["_private"][$player_id] = [
                "locations" => $locations,
                'locations_unavailable' => array_values(array_map(fn ($w) => intval($w['location_arg']), $workers_board)),
                "workers" => array_values($workers_player),
                "wheelbarrow" => Globals::getWheelbarrow($player_id),
                "wheelbarrow_count" => Players::countWheelbarrow($player_id),
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

        $has_scale = Improvements::hasScale($player_id);

        return [
            'locations' => array_values($locations),
            'wheelbarrow' => Globals::getWheelbarrow($player_id),
            'resolve_market' => Globals::getMarketUsed(),
            'has_scale' => $has_scale,
            'use_scale' => $has_scale && Globals::getScaleUsed()
        ];
    }

    function argPlayerTurnDiscard() {
        return [
            'nbr' => sizeof(Comforts::getHand(Players::getPlayerId())) - 3,
        ];
    }

    function argCanadaLynx() {
        $current_player_id = $this->getActivePlayerId();
        $left_player_id = Game::get()->getPrevPlayerTable()[$current_player_id];

        return [
            'otherplayer' => Game::get()->getPlayerNameById($left_player_id),
            'otherplayer_id' => $left_player_id,
        ];
    }

    function argCommonLoon() {
        $current_player_id = $this->getCurrentPlayerId();
        $left_player_id = Game::get()->getPrevPlayerTable()[$current_player_id];
        $workers = Worker::getWorkersFromPlayer($left_player_id);
        $worker = array_shift($workers);

        return [
            'otherplayer' => Game::get()->getPlayerNameById($left_player_id),
            'otherplayer_id' => $left_player_id,
            '_private' => [
                $current_player_id => [
                    'locations' => Globals::getWorkerPlacement($current_player_id),
                    'locations_unavailable' => [],
                    'workers' => [$worker],
                    "wheelbarrow" => 0,
                    "wheelbarrow_count" => 0,
                ]
            ]
        ];
    }

    function argCommonRaven() {
        return [
            "locations_unavailable" => Globals::getRavenLocationIds(),
        ];
    }

    function argMoose() {
        $current_player_id = $this->getActivePlayerId();
        $left_player_id = Game::get()->getPrevPlayerTable()[$current_player_id];

        return [
            'otherplayer' => Game::get()->getPlayerNameById($left_player_id),
            'otherplayer_id' => $left_player_id,
        ];
    }

    function argWildTurkey() {
        $players = Game::get()->loadPlayersBasicInfos();
        $args = ["_private" => []];

        foreach ($players as $player_id => $player) {
            $die_info = Globals::getWildTurkeyDice($player_id);
            $args["_private"][$player_id] = [
                "values" => $die_info,
                "die_id" => array_key_exists('die_id', $die_info) ? intval($die_info['die_id']) : 0,
                'die_value' => array_key_exists('die_value', $die_info) ? intval($die_info['die_value']) : 0,
            ];
        }

        return $args;
    }
}
