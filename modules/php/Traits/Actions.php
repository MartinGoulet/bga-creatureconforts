<?php

namespace CreatureConforts\Traits;

use BgaUserException;
use CreatureConforts\Core\Game;
use CreatureConforts\Core\Globals;
use CreatureConforts\Core\Notifications;
use CreatureConforts\Helpers\DiceHelper;
use CreatureConforts\Helpers\MarketHelper;
use CreatureConforts\Helpers\ResourcesHelper;
use CreatureConforts\Helpers\TravelerHelper;
use CreatureConforts\Managers\Conforts;
use CreatureConforts\Managers\Dice;
use CreatureConforts\Managers\Players;
use CreatureConforts\Managers\Travelers;
use CreatureConforts\Managers\Valleys;
use CreatureConforts\Managers\Worker;

trait Actions {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    ////////////

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in CreatureConforts.action.php)
    */

    function discardStartHand(int $card_id) {
        $current_player_id = $this->getCurrentPlayerId();
        $card = Conforts::get($card_id);

        if ($card['location'] !== 'hand' || $card['location_arg'] !== $current_player_id) {
            throw new \BgaUserException("You don't own the card");
        }

        // All checks are ok, now proceed
        Conforts::remainderStartHand($card_id, $current_player_id);

        // Desactivate the current player
        $this->gamestate->setPlayerNonMultiactive($current_player_id, '');
    }

    function cancelStartHand() {
        $current_player_id = $this->getCurrentPlayerId();
        $this->gamestate->setPlayersMultiactive([$current_player_id], '');
        Conforts::cancelStartHand($current_player_id);
    }

    function confirmPlacement(array $locations) {
        // Basic location
        $available_locations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        // TODO add location from cards

        foreach ($locations as $location) {
            if (!in_array($location, $available_locations)) {
                throw new BgaUserException(self::_("You are not allowed to go one of the location you choose (" . $location . "}"));
            }
        }

        $current_player_id = $this->getCurrentPlayerId();
        Globals::setWorkerPlacement($current_player_id, $locations);
        $this->gamestate->setPlayerNonMultiactive($current_player_id, '');
    }

    function cancelPlacement() {
        $current_player_id = $this->getCurrentPlayerId();
        $this->gamestate->setPlayersMultiactive([$current_player_id], '');
        Globals::setWorkerPlacement($current_player_id, []);
    }

    function confirmPlayerDice(array $dice_ids, array $location_ids) {
        $dice_by_locations = [];
        // Group dice by location
        for ($i = 0; $i < sizeof($dice_ids); $i++) {
            $location_id = intval($location_ids[$i]);
            if (!array_key_exists($location_id, $dice_by_locations)) {
                $dice_by_locations[$location_id] = [];
            }
            $dice_by_locations[$location_id][] = intval($dice_ids[$i]);
        }

        $error = [];
        foreach ($dice_by_locations as $location_id => $dice) {
            if (!DiceHelper::isRequirementMet($location_id, $dice)) {
                $error[] = $location_id;
            } else {
                Dice::moveDiceToLocation($dice, $location_id);
            }
        }
        if (sizeof($error) > 0) {
            throw new BgaUserException("Requirement not met for location " . implode(",", $error));
        }

        Notifications::moveDiceToLocation(Dice::getDice($dice_ids));
        Game::get()->gamestate->nextState();
    }

    function resolveWorker(int $location_id, array $resources, array $resources2) {
        $player_id = $this->getActivePlayerId();

        $worker = Worker::returnToPlayerBoard($player_id, $location_id);
        if ($worker == null) {
            throw new BgaUserException("No worker in this location, please refresh your page");
        }

        Notifications::returnToPlayerBoard($worker);

        $dice = Dice::getDiceInLocation($location_id);

        if (sizeof($dice) == 0) {
            Players::addResources($player_id, [LESSON_LEARNED => 1]);
            Notifications::getResourcesFromLocation($player_id, $location_id, [LESSON_LEARNED => 1]);
            $this->resolveWorkerNextStep();
            return;
        }

        if ($location_id >= 1 && $location_id <= 4) {
            $valley = Valleys::getValleyLocationInfo($location_id);
            Players::addResources($player_id, $valley['resources']);
            Notifications::getResourcesFromLocation($player_id, $location_id, $valley['resources']);
            $this->resolveWorkerNextStep();
            return;
        }

        if ($location_id >= 5 && $location_id <= 7) {
            $resources = [
                5 => [COIN => 1, STONE => 1],
                6 => [STONE => 2],
                7 => [STONE => 1],
            ];
            Players::addResources($player_id, $resources[$location_id]);
            Notifications::getResourcesFromLocation($player_id, $location_id, $resources[$location_id]);
            $this->resolveWorkerNextStep();
            return;
        }

        if ($location_id == 8) {
            $converted_resources = ResourcesHelper::convertNumberToResource($resources);
            $converted_resources2 = ResourcesHelper::convertNumberToResource($resources2);
            MarketHelper::resolve($converted_resources, $converted_resources2);
            $this->resolveWorkerNextStep();
            return;
        }

        if ($location_id == 9) {
            $die = array_shift($dice);
            $converted_resources = ResourcesHelper::convertNumberToResource($resources);
            TravelerHelper::resolve($die, $converted_resources);
            $this->resolveWorkerNextStep();
            return;
        }

        if ($location_id == 11) {
            $slot_id = intval(array_shift($resources));
            if($slot_id < 1 || $slot_id > 4) {
                throw new BgaUserException("Slot id must be between 1 and 4");
            }
            $card = Conforts::addToHand(Conforts::getFromMarket($slot_id), $player_id);
            Notifications::addConfortToHand(Players::getPlayerId(), $card);
            Conforts::refillOwlNest();
            Notifications::refillOwlNest(Conforts::getOwlNest());
            $this->resolveWorkerNextStep();
            return;
        }

        if ($location_id == 12) {
            $die = array_shift($dice);
            if(intval($die['face']) <= 2) {
                $cards = Conforts::draw(Players::getPlayerId(), 2);
                Notifications::drawConfort(Players::getPlayerId(), $cards);
            } else {
                $card = Conforts::draw(Players::getPlayerId());
                Notifications::drawConfort(Players::getPlayerId(), [$card]);
            }
            $this->resolveWorkerNextStep();
            return;
        }

        throw new BgaUserException("Not implemented yet");
    }

    private function resolveWorkerNextStep() {
        $player_id = $this->getActivePlayerId();

        $workers_not_home = array_filter(Worker::getWorkersFromPlayer($player_id), function ($worker) {
            return $worker['location'] !== 'player';
        });

        $next_step = count($workers_not_home) > 0 ? "next" : "end";
        Game::get()->gamestate->nextState($next_step);
    }

    function confirmResolveWorker() {
        Game::get()->gamestate->nextState('end');
    }

    function craftConfort(int $card_id, array $resources) {

        $player_id = intval($this->getActivePlayerId());
        $card = Conforts::get($card_id);
        if ($card['location'] != 'hand' || $card['location_arg'] != $player_id) {
            throw new BgaUserException("The card is not in your hand");
        }

        $cost = Conforts::getCost($card);

        if (array_key_exists(ANY_RESOURCE, $cost)) {
            if (sizeof($resources) !== $cost[ANY_RESOURCE]) {
                throw new BgaUserException("Not the right amount of resources");
            }

            unset($cost[ANY_RESOURCE]);
            foreach ($resources as $idResource) {
                $code = $this->good_types[$idResource];
                if (array_key_exists($code, $cost)) {
                    $cost[$code] += 1;
                } else {
                    $cost[$code] = 1;
                }
            }
        }

        if (!Players::hasEnoughResource($player_id, $cost)) {
            throw new BgaUserException("Not enough resource");
        }

        Players::removeResource($player_id, $cost);
        Conforts::moveCardToPlayerBoard($player_id, $card_id);

        $card = Conforts::get($card_id);
        Notifications::craftConfort($player_id, $card, $cost);

        Game::get()->gamestate->nextState('craft');
    }

    function passCraftConfort() {
        Game::get()->gamestate->nextState('end');
    }

    function discardConfort(array $card_ids) {
        $player_id = Players::getPlayerId();
        $cards = Conforts::getCards($card_ids);
        foreach ($cards as $card_id => $card) {
            if($card['location'] !== 'hand' || intval($card['location_arg']) !== $player_id) {
                var_dump($card);
                throw new BgaUserException("The card is not in your hand");
            }
            Conforts::addCardToDiscard($card_id);
        }
        Notifications::discardConfort($cards);
        Game::get()->gamestate->nextState();
    }

    function undo() {
        Game::undoRestorePoint();
    }
}
