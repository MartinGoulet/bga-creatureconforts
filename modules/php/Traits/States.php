<?php

namespace CreatureConforts\Traits;

use CreatureConforts\Core\Game;
use CreatureConforts\Core\Globals;
use CreatureConforts\Core\Notifications;
use CreatureConforts\Managers\Conforts;
use CreatureConforts\Managers\Dice;
use CreatureConforts\Managers\Improvements;
use CreatureConforts\Managers\Players;
use CreatureConforts\Managers\Travelers;
use CreatureConforts\Managers\Valleys;
use CreatureConforts\Managers\Worker;

trait States {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Game state actions
    ////////////

    function stStartHandDiscard() {
        $discarded_cards = Conforts::discardStartHand();
        Notifications::discardStartHand($discarded_cards);
        Game::get()->gamestate->nextState();
    }

    function stNewTraveler() {
        $isFirstTurn = Travelers::count() == 15;
        if (!$isFirstTurn) {
            Travelers::discardTopCard();
        }
        Travelers::revealTopCard();
        Notifications::newTraveler();

        $players = Game::get()->loadPlayersBasicInfos();
        foreach ($players as $player_id => $player) {
            Globals::setWorkerPlacement(intval($player_id), []);
        }

        Game::get()->gamestate->nextState();
    }

    function stFamilyDice() {
        Dice::throwPlayerDice();

        $players = Game::get()->loadPlayersBasicInfos();
        foreach ($players as $player_id => $player) {
            Notifications::familyDice(intval($player_id), Dice::getDiceFromPlayer(intval($player_id)));
        }

        Game::get()->gamestate->nextState();
    }

    function stPlacementEnd() {
        $players = Game::get()->loadPlayersBasicInfos();

        foreach ($players as $player_id => $player) {
            $locations = Globals::getWorkerPlacement($player_id);
            $workers = array_values(Worker::getWorkersFromPlayer($player_id));
            foreach ($locations as $location) {
                $worker = array_shift($workers);
                Worker::moveToLocation($worker['id'], $location);
            }
            Globals::setWorkerPlacement($player_id, []);
        }

        Notifications::revealPlacement(Worker::getUIData());
        Game::get()->gamestate->nextState();
    }

    function stVillageDice() {
        Dice::throwWhiteDice();
        Notifications::villageDice(Dice::getWhiteDice());
        Game::get()->gamestate->nextState();
    }

    function stPlayerTurnStart() {
        $player_id = $this->getActivePlayerId();
        Dice::movePlayerDiceToHill($player_id);

        $dice = Dice::getDiceFromPlayer($player_id);
        Notifications::moveDiceToHill($dice);
        Game::get()->undoSavepoint();
        Game::get()->gamestate->nextState();
    }

    function stPlayerTurnEnd() {
        $player_id = $this->getActivePlayerId();
        // Return dices
        Dice::moveWhiteDiceToHill();
        Dice::movePlayerDiceToBoard($player_id);

        Notifications::returnDice($player_id, Dice::getUIData());

        $next_state = sizeof(Conforts::getHand($player_id)) > 3 ? 'discard' : 'next';
        Game::get()->gamestate->nextState($next_state);
    }

    function stPlayerTurnNext() {
        $current_player_id = $this->getActivePlayerId();
        $next_player_id = intval(Game::get()->getNextPlayerTable()[$current_player_id]);
        if ($next_player_id == Globals::getFirstPlayerId()) {
            // All player has played their turn
            Game::get()->gamestate->nextState('end');
        } else {
            Game::get()->giveExtraTime($current_player_id);
            Game::get()->activeNextPlayer();
            Game::get()->gamestate->nextState('next');
        }
    }

    function stUnkeep() {
        // Discard the top Forest and Meadow cards on the Valley stacks from the game,
        // revealing the new ones for the upcoming month and progressing further
        // through the seasons.

        Valleys::nextSeason();
        $info = Valleys::getUIData();
        Notifications::newSeason($info);

        // TODO : Verification for winter
        if ($info[FOREST]['count'] == 0) {
            Game::get()->gamestate->nextState('end');
            return;
        }

        // 1. Rotate the River dial one notch clockwise.
        $next_value =  Globals::getRiverDialValue() == 1 ? 6 : Globals::getRiverDialValue() - 1;
        Globals::setRiverDialValue($next_value);
        Notifications::riverDialRotate($next_value);

        // 2. Discard the leftmost Comfort from the Owl’s Nest, slide the other three
        // cards one slot left, and deal a new Comfort from the deck face up into the
        // empty rightmost slot.
        $discard = Conforts::discardLeftMostOwlNest();
        Conforts::refillOwlNest();
        Notifications::refillOwlNest(Conforts::getOwlNest(), $discard);

        // Discard the Improvement in the bottom ladder slot from the Workshop,
        // then slide the five remaining Improvements down a slot and deal a new
        // Improvement from the deck face up into the top slot.
        $discard = Improvements::discardBottomLadder();
        Improvements::refillLadder();
        Notifications::refillLadder(Improvements::getLadder(), $discard);

        // 3. Discard the Traveler from the Inn.
        Travelers::discardTopCard();
        Notifications::discardTraveler();

        // 4. The Early Bird passes the Worm clockwise. That player is the new Early
        // Bird. The Early Bird takes the Village dice to roll later.
        $active_player_id = intval($this->getActivePlayerId());
        Globals::setFirstPlayerId($active_player_id);
        Notifications::newFirstPlayer($active_player_id);

        // Start the new month with Step 1: New Traveler.
        Game::get()->gamestate->nextState();
    }
}
