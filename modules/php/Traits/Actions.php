<?php

namespace CreatureComforts\Traits;

use BgaUserException;
use CreatureComforts\Core\Game;
use CreatureComforts\Core\Globals;
use CreatureComforts\Core\Notifications;
use CreatureComforts\Helpers\DiceHelper;
use CreatureComforts\Helpers\ImprovementHelper;
use CreatureComforts\Helpers\MarketHelper;
use CreatureComforts\Helpers\ResourcesHelper;
use CreatureComforts\Helpers\TravelerHelper;
use CreatureComforts\Helpers\WorkshopHelper;
use CreatureComforts\Managers\Comforts;
use CreatureComforts\Managers\Dice;
use CreatureComforts\Managers\Improvements;
use CreatureComforts\Managers\Players;
use CreatureComforts\Managers\Travelers;
use CreatureComforts\Managers\Valleys;
use CreatureComforts\Managers\Worker;

trait Actions {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    ////////////

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in CreatureComforts.action.php)
    */

    function discardStartHand(int $card_id) {
        $current_player_id = $this->getCurrentPlayerId();
        $card = Comforts::get($card_id);

        if ($card['location'] !== 'hand' || $card['location_arg'] !== $current_player_id) {
            throw new \BgaUserException("You don't own the card");
        }

        // All checks are ok, now proceed
        Comforts::remainderStartHand($card_id, $current_player_id);

        // Desactivate the current player
        $this->gamestate->setPlayerNonMultiactive($current_player_id, '');
    }

    function cancelStartHand() {
        $current_player_id = $this->getCurrentPlayerId();
        $this->gamestate->setPlayersMultiactive([$current_player_id], '');
        Comforts::cancelStartHand($current_player_id);
    }

    function confirmPlacement(array $locations, int $wheelbarrow) {
        $current_player_id = $this->getCurrentPlayerId();

        // Basic location
        $available_locations = TravelerHelper::isActivePineMarten()
            ? [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
            : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        foreach ($locations as $location) {
            if (!in_array($location, $available_locations)) {
                throw new BgaUserException(self::_("You are not allowed to go one of the location you choose (" . $location . "}"));
            }
        }

        if ($wheelbarrow > 0) {

            if (!Players::hasWheelbarrow($current_player_id)) {
                throw new BgaUserException("You dont have any wheelbarrow");
            }
            if ($wheelbarrow < 1 || $wheelbarrow > 7) {
                throw new BgaUserException("Location must be between 1 and 7");
            }
            Globals::setWheelbarrow($current_player_id, $wheelbarrow);
        }

        Globals::setWorkerPlacement($current_player_id, $locations);
        $this->gamestate->setPlayerNonMultiactive($current_player_id, '');
    }

    function cancelPlacement() {
        $current_player_id = $this->getCurrentPlayerId();
        $this->gamestate->setPlayersMultiactive([$current_player_id], '');
        Globals::setWorkerPlacement($current_player_id, []);
        Globals::setWheelbarrow($current_player_id, 0);
    }

    function confirmPlayerDice(array $dice_ids, array $location_ids, array $lesson, array $umbrella) {

        $count_umbrella = 0;
        $sum_lesson = 0;

        $infos = [];
        for ($i = 0; $i < sizeof($dice_ids); $i++) {
            $info = [
                'die'      => intval($dice_ids[$i]),
                'location' => intval($location_ids[$i]),
                'lesson'   => intval($lesson[$i]),
                'umbrella' => intval($umbrella[$i]),
            ];
            $count_umbrella += in_array($info['umbrella'], [1, 2]) ? 1 : 0;
            $sum_lesson += $info['lesson'];
            $infos[$info['die']] = $info;
        }

        $count_almanac = Players::countAlmanac(Players::getPlayerId());
        if ($count_almanac > 0) {
            $sum_lesson = $sum_lesson >= $count_almanac ? $sum_lesson - $count_almanac : 0;
        }

        if (TravelerHelper::isActiveLeopardFrog()) {
            $sum_lesson -= 2;
        }

        if ($sum_lesson > 0) {
            if (!Players::hasEnoughResource(Players::getPlayerId(), [LESSON_LEARNED => $sum_lesson])) {
                throw new BgaUserException("Not enough lesson learned");
            }
            Players::removeResource(Players::getPlayerId(), [LESSON_LEARNED => $sum_lesson]);
        }

        if ($count_umbrella > 0 && !Improvements::hasUmbrella(Players::getPlayerId())) {
            throw new BgaUserException("You dont have the Umbrella");
        }

        $dice = Dice::getDice($dice_ids);
        $dice_by_locations = [];
        $dice_value_by_location = [];
        // Group dice by location

        $error = [];
        foreach ($dice as $die) {
            $die_id = intval($die['id']);
            $info = $infos[$die_id];
            $value = intval($die['face']) + $info['lesson'] + $info['umbrella'];
            $location_id = $info['location'];
            if (!array_key_exists($location_id, $dice_by_locations)) {
                $dice_by_locations[$location_id] = [];
                $dice_value_by_location[$location_id] = [];
            }

            $dice_by_locations[$location_id][] = $die_id;
            $dice_value_by_location[$location_id][] = $value;

            if(abs($info['umbrella']) > 0) {
                $value_umbrella = intval($die['face']) + $info['umbrella'];
                Notifications::modifyDieWithUmbrella(Players::getPlayerId(), $die, $value_umbrella,  $info['umbrella']);
                $die['face'] = $value_umbrella;
            }

            if ($info['lesson'] != 0) {
                Dice::modify($die_id, $value);
                Notifications::modifyDieWithLessonLearned(Players::getPlayerId(), $die, $value, $info['lesson']);
            }

            if (!in_array($location_id, [1, 2, 3, 4, 5, 6, 7, 9, 10, 12]) && $value !== intval($die['face'])) {
                $error[] = $location_id;
            }
        }

        if (sizeof($error) > 0) {
            throw new BgaUserException("You cannot use modifier on this location " . implode(",", $error));
        }

        $error = [];
        foreach ($dice_by_locations as $location_id => $dice) {
            if (!DiceHelper::isRequirementMet($location_id, $dice, $dice_value_by_location[$location_id])) {
                $error[] = $location_id;
                $error[] = "(" . json_encode($dice_value_by_location[$location_id]) . ")";
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

    function resolveWorker(int $location_id, array $resources, array $resources2, array $card_ids, int $option) {
        $player_id = $this->getActivePlayerId();

        $dice = Dice::getDiceInLocation($location_id);

        if (sizeof($dice) == 0) {
            throw new BgaUserException("No dice here");
        }

        if ($location_id >= 20) {
            ImprovementHelper::resolve($location_id, $resources, $resources2);
            $this->resolveWorkerNextStep($location_id);
            return;
        }

        // Market will return at the end of the phase (multiple use)
        if ($location_id != 8 || ($location_id == 8 && $option == 2)) {
            $worker = Worker::returnToPlayerBoard($player_id, $location_id);
            if ($worker !== null) {
                Notifications::returnToPlayerBoard($worker);
                // throw new BgaUserException("No worker in this location, please refresh your page");
            }
            // return dice
            $white_dice = array_values(array_filter($dice, function ($die) {
                return $die['type'] == "white";
            }));
            if (sizeof($white_dice) > 0) {
                Dice::moveWhiteDiceToHill($white_dice);
            }
            $player_dice = array_filter($dice, function ($die) {
                return $die['type'] !== "white";
            });
            if (sizeof($player_dice) > 0) {
                Dice::movePlayerDiceToBoard($player_id, $player_dice);
            }
            Notifications::returnDice($player_id, $dice);
        } else {
            Globals::setMarketUsed(true);
        }

        if ($location_id >= 1 && $location_id <= 4) {
            $valley = Valleys::getValleyLocationInfo($location_id);
            Players::addResources($player_id, $valley['resources']);
            Notifications::getResourcesFromLocation($player_id, $location_id, $valley['resources']);
            if (TravelerHelper::isActiveBlackBear()) {
                Players::addResources($player_id, [FRUIT => 1]);
                Notifications::abilityBlackBear($player_id, $location_id, [FRUIT => 1]);
            }
            $this->resolveWheelbarrow($location_id, $resources);
            $this->resolveWorkerNextStep($location_id);
            return;
        }

        if ($location_id >= 5 && $location_id <= 7) {
            $resources_conv = [
                5 => [COIN => 1, STONE => 1],
                6 => [STONE => 2],
                7 => [STONE => 1],
            ];
            Players::addResources($player_id, $resources_conv[$location_id]);
            Notifications::getResourcesFromLocation($player_id, $location_id, $resources_conv[$location_id]);
            $this->resolveWheelbarrow($location_id, $resources);
            $this->resolveWorkerNextStep($location_id);
            return;
        }

        if ($location_id == 8) {
            $converted_resources = ResourcesHelper::convertNumberToResource($resources);
            $converted_resources2 = ResourcesHelper::convertNumberToResource($resources2);
            MarketHelper::resolve($converted_resources, $converted_resources2, $option);
            $this->resolveWorkerNextStep($location_id, $option);
            return;
        }

        if ($location_id == 9) {
            $die = array_shift($dice);
            $converted_resources = ResourcesHelper::convertNumberToResource($resources);
            $converted_resources_get = ResourcesHelper::convertNumberToResource($resources2);
            TravelerHelper::resolve($die, $converted_resources, $converted_resources_get, $card_ids);
            $this->resolveWorkerNextStep($location_id);
            return;
        }

        if ($location_id == 10) {
            $die = array_shift($dice);
            $converted_resources = ResourcesHelper::convertNumberToResource($resources);
            WorkshopHelper::resolve(intval($die['face']), intval(array_shift($resources)));
            Game::undoSavepoint();
            $this->resolveWorkerNextStep($location_id);
            return;
        }

        if ($location_id == 11) {
            $slot_id = intval(array_shift($resources));
            if ($slot_id < 1 || $slot_id > 4) {
                throw new BgaUserException("Slot id must be between 1 and 4");
            }
            $card = Comforts::addToHand(Comforts::getFromMarket($slot_id), $player_id);
            Notifications::addConfortToHand(Players::getPlayerId(), $card);
            Comforts::refillOwlNest();
            Notifications::refillOwlNest(Comforts::getOwlNest());
            Game::undoSavepoint();
            $this->resolveWorkerNextStep($location_id);
            return;
        }

        if ($location_id == 12) {
            $die = array_shift($dice);
            if (intval($die['face']) <= 2) {
                $cards = Comforts::draw(Players::getPlayerId(), 2);
                Notifications::drawConfort(Players::getPlayerId(), $cards);
            } else {
                $card = Comforts::draw(Players::getPlayerId());
                Notifications::drawConfort(Players::getPlayerId(), [$card]);
            }
            Game::undoSavepoint();
            $this->resolveWorkerNextStep($location_id);
            return;
        }

        throw new BgaUserException("Not implemented yet");
    }

    private function resolveWheelbarrow(int $location_id, $resources) {
        $wheelbarrow = Globals::getWheelbarrow($location_id);
        if ($wheelbarrow == $location_id) {
            if (sizeof($resources) !== 1) {
                throw new BgaUserException("You have to choose a resource for wheelbarrow");
            }
            Globals::setWheelbarrow(Players::getPlayerId(), 0);
            Players::addResources(Players::getPlayerId(), $resources);
            Notifications::getResourceFromWheelbarrow($location_id, $resources);
        }
    }

    private function resolveWorkerNextStep(int $location_id, $option = 0) {
        $player_id = $this->getActivePlayerId();

        if (TravelerHelper::isActiveCommonRaven()) {
            $skip = $location_id == 8 && $option != 2;
            if (!$skip) {
                $raven_location_ids = Globals::getRavenLocationIds();
                if (in_array($location_id, $raven_location_ids)) {
                    Players::addResources(Players::getPlayerId(), [COIN => 1]);
                    Notifications::getResourcesFromLocation(Players::getPlayerId(), $location_id, [COIN => 1]);
                }
            }
        }

        if (in_array($location_id, [11, 12]) && TravelerHelper::isActiveStripedSkunk()) {
            Game::get()->gamestate->nextState('striped_skunk');
            return;
        }

        if (in_array($location_id, [1, 2]) && TravelerHelper::isActiveAmericanBeaver()) {
            Players::addResources(Players::getPlayerId(), [WOOD => 2]);
            Notifications::getResourcesFromLocation(Players::getPlayerId(), $location_id, [WOOD => 2]);
        }

        $workers_not_home = array_filter(Worker::getWorkersFromPlayer($player_id), function ($worker) {
            return $worker['location'] !== 'player';
        });

        $next_step = count($workers_not_home) > 0 || Dice::countDiceInGlade() > 0 ? "next" : "end";
        Game::get()->gamestate->nextState($next_step);
    }

    function confirmResolveWorker() {
        Game::get()->gamestate->nextState('end');
    }

    function craftConfort(int $card_id, array $resources) {

        $player_id = intval($this->getActivePlayerId());
        $card = Comforts::get($card_id);
        if ($card['location'] != 'hand' || $card['location_arg'] != $player_id) {
            throw new BgaUserException("The card is not in your hand");
        }

        $cost = Comforts::getCost($card);

        if (TravelerHelper::isActivePileatedWoodpecker() && array_key_exists(WOOD, $cost)) {
            $cost[WOOD] -= 1;
            if ($cost[WOOD] === 0) {
                unset($cost[WOOD]);
            }
        }

        if (array_key_exists(ANY_RESOURCE, $cost)) {
            // Board game card
            if (sizeof($resources) !== 4) {
                throw new BgaUserException("Not the right amount of resources");
            }
            // Remove two last resources (coin and story)
            $generic_resources = array_slice($resources, 0, 2, false);

            $new_cost = [];
            foreach ($generic_resources as $idResource) {
                $code = $this->good_types[$idResource];
                if (array_key_exists($code, $new_cost)) {
                    $new_cost[$code] += 1;
                } else {
                    $new_cost[$code] = 1;
                }
            }

            $new_cost[COIN] = 1;
            $new_cost[STORY] = 1;
            $cost = $new_cost;
        }

        if (TravelerHelper::isActiveHairyTailedHole() && sizeof($resources) > 0) {
            $group = ResourcesHelper::groupByType(ResourcesHelper::convertNumberToResource($resources));
            // throw new BgaUserException(json_encode(($cost)));
            $isOk = true;
            $sumStoneCoin = 0;
            foreach ($cost as $resource => $count) {
                if (!in_array($resource, [STONE, COIN])) {
                    $isOk = $isOk && (array_key_exists($resource, $group) && $group[$resource] == $count);
                } else {
                    $sumStoneCoin += $count;
                }
            }
            if (!$isOk) {
                throw new BgaUserException("Resources does not match 1");
            }
            $isOk = $isOk && (($group[STONE] ?? 0) + ($group[COIN] ?? 0) === $sumStoneCoin);
            if (!$isOk) {
                throw new BgaUserException("Resources does not match");
            }
            $cost = $group;
        }

        if (!Players::hasEnoughResource($player_id, $cost)) {
            throw new BgaUserException("Not enough resource");
        }

        Players::removeResource($player_id, $cost);
        Comforts::moveCardToPlayerBoard($player_id, $card_id);

        $card = Comforts::get($card_id);
        Notifications::craftConfort($player_id, $card, $cost);

        Game::get()->gamestate->nextState('craft');
    }

    function passCraftConfort() {
        Game::get()->gamestate->nextState('end');
    }

    function discardConfort(array $card_ids) {
        $player_id = Players::getPlayerId();
        $cards = Comforts::getCards($card_ids);
        foreach ($cards as $card_id => $card) {
            if ($card['location'] !== 'hand' || intval($card['location_arg']) !== $player_id) {
                var_dump($card);
                throw new BgaUserException("The card is not in your hand");
            }
            Comforts::addCardToDiscard($card_id);
        }
        Notifications::discardConfort($cards);
        Game::get()->gamestate->nextState();
    }

    function confirmStoreResource(array $infos) {
        $current_player_id = $this->getCurrentPlayerId();

        foreach ($infos as $key => $info) {
            $card_id = array_shift($info);
            $resources = ResourcesHelper::convertNumberToResource($info);
            Globals::setComfortResource($card_id, $resources);
            Players::removeResource($current_player_id, ResourcesHelper::groupByType($resources));
        }

        // Desactivate the current player
        $this->gamestate->setPlayerNonMultiactive($current_player_id, '');
    }

    function confirmGrayWolf(int $slot_id) {
        if ($slot_id < 1 || $slot_id > 4) {
            throw new BgaUserException("Slot id must be between 1 and 4");
        }
        $player_id = Players::getPlayerId();
        $card = Comforts::addToHand(Comforts::getFromMarket($slot_id), $player_id);
        Notifications::addConfortToHand(Players::getPlayerId(), $card);
        Comforts::refillOwlNest();
        Notifications::refillOwlNest(Comforts::getOwlNest());
        Game::get()->gamestate->nextState();
    }

    function confirmCanadaLynx(array $resources) {
        $resources = ResourcesHelper::convertNumberToResource($resources);
        $group = ResourcesHelper::groupByType($resources);
        if (sizeof($group) !== 2 || sizeof($resources) !== 2) {
            throw new BgaUserException("Error with the number of resources");
        }
        $left_player_id = intval($this->argCanadaLynx()['otherplayer_id']);
        Players::addResources($left_player_id, $group);
        Notifications::travelerReceivedResources($group, $left_player_id);
        Game::get()->gamestate->nextState();
    }

    function confirmCommonRaven(int $location_id) {
        $raven_location_ids = Globals::getRavenLocationIds() ?? [];
        if (in_array($location_id, $raven_location_ids)) {
            throw new BgaUserException("The location was already taken");
        }
        $raven_location_ids[] = $location_id;
        Globals::setRavenLocationIds($raven_location_ids);
        Notifications::newRavenLocationTaken($location_id);
        Game::get()->gamestate->nextState();
    }

    function confirmMoose(int $resource) {
        if ($resource > 0) {
            $resources = ResourcesHelper::convertNumberToResource([$resource]);
            $group = ResourcesHelper::groupByType($resources);
            $left_player_id = intval($this->argMoose()['otherplayer_id']);
            Players::addResources($left_player_id, $group);
            Players::removeResource(Players::getPlayerId(), $group);
            Players::addResources(Players::getPlayerId(), [STORY => 1]);
            Notifications::travelerExchangeResources($group, [STORY => 1]);
            Notifications::travelerReceivedResources($group, $left_player_id);
        }
        Game::get()->gamestate->nextState();
    }

    function confirmStripedSkunk(int $card_id) {
        $discard = Comforts::getDiscard();
        $card_ids = array_column($discard, 'id');
        if (!in_array($card_id, $card_ids)) {
            throw new BgaUserException("The card is not in the discard pile");
        }

        $card = Comforts::addToHand(['id' => $card_id], Players::getPlayerId());
        Notifications::addConfortToHand(Players::getPlayerId(), $card);
        Game::get()->gamestate->nextState("next");
    }

    function confirmBicycle(int $location_id_from, int $location_id_to) {
        $workers = Worker::getWorkersFromPlayer(Players::getPlayerId());
        $worker = array_filter($workers, function ($w) use ($location_id_from) {
            return $w['location_arg'] == $location_id_from;
        });

        $worker = array_shift($worker);

        if ($worker == null) {
            throw new BgaUserException("This is not your worker");
        }

        if (in_array($location_id_to, [1, 2]) && TravelerHelper::isActivePineMarten()) {
            throw new BgaUserException("You cannot go there with Pine Marten in play");
        }

        $worker_locations = array_values(array_column($workers, 'location_arg'));
        if (in_array($location_id_to, $worker_locations)) {
            throw new BgaUserException("Worker already in that location");
        }

        if ($location_id_to <= 0 || $location_id_to > 12) {
            throw new BgaUserException("Location must be between 1 and 12 => " . $location_id_to);
        }

        Worker::moveToLocation($worker['id'], $location_id_to);
        Notifications::revealPlacement(Worker::getUIData());

        Game::get()->gamestate->nextState('next');
    }

    function confirmWildTurkey(int $die_id, int $die_value) {
        $current_player_id = $this->getCurrentPlayerId();
        Globals::setWildTurkeyDice($current_player_id, [
            'die_id' => $die_id,
            'die_value' => $die_value,
        ]);
        // Desactivate the current player
        $this->gamestate->setPlayerNonMultiactive($current_player_id, '');
    }

    function cancelWildTurkey() {
        $current_player_id = $this->getCurrentPlayerId();
        Globals::setWildTurkeyDice($current_player_id, []);
        $this->gamestate->setPlayersMultiactive([$current_player_id], '');
    }

    function pass(bool $notification) {
        if ($notification) {
            Notifications::pass(Players::getPlayerId());
        }
        Game::get()->gamestate->nextState('pass');
    }

    function undo() {
        Game::undoRestorePoint();
    }

    public function confirmBlueJay(int $location_id, array $dice_ids) {
        $current_player_id = $this->getCurrentPlayerId();
        Globals::setBlueJayInfo($current_player_id, $location_id, $dice_ids);
        // Desactivate the current player
        $this->gamestate->setPlayerNonMultiactive($current_player_id, '');
    }
    

    public function cancelBlueJay() {
        $current_player_id = $this->getCurrentPlayerId();
        Globals::setBlueJayInfo($current_player_id, -1, []);
        $this->gamestate->setPlayersMultiactive([$current_player_id], '');
    }
    
}
