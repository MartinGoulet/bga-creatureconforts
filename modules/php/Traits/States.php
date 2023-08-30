<?php

namespace CreatureConforts\Traits;

use BgaUserException;
use CreatureConforts\Core\Game;
use CreatureConforts\Core\Globals;
use CreatureConforts\Core\Notifications;
use CreatureConforts\Managers\Conforts;
use CreatureConforts\Managers\Dice;
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
        if(!$isFirstTurn) {
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
}
