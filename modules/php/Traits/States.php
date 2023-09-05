<?php

namespace CreatureConforts\Traits;

use CreatureConforts\Core\Game;
use CreatureConforts\Core\Globals;
use CreatureConforts\Core\Notifications;
use CreatureConforts\Managers\Conforts;
use CreatureConforts\Managers\Dice;
use CreatureConforts\Managers\Players;
use CreatureConforts\Managers\Travelers;
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
        Game::get()->gamestate->nextState();
    }

    function stFamilyDice() {
        Dice::throwPlayerDice();
        Notifications::familyDice(Dice::getUIData());
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
        }

        Notifications::revealPlacement(Worker::getUIData());
        Game::get()->gamestate->nextState();
    }

    function stVillageDice() {
        Dice::throwWhiteDice();
        Notifications::villageDice(Dice::getUIData());
        Game::get()->gamestate->nextState();
    }

    function stPlayerTurnStart() {
        $player_id = $this->getActivePlayerId();
        Dice::movePlayerDiceToHill($player_id);

        $dice = Dice::getDiceFromPlayer($player_id);
        Notifications::moveDiceToHill($dice);
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
        if($next_player_id == Globals::getFirstPlayerId()) {
            // All player has played their turn
            Game::get()->gamestate->nextState('end');
        } else {
            Game::get()->giveExtraTime($current_player_id);
            Game::get()->activeNextPlayer();
            Game::get()->gamestate->nextState('next');
        }
    }
}
