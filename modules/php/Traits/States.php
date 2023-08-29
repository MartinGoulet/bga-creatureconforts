<?php

namespace CreatureConforts\Traits;

use BgaUserException;
use CreatureConforts\Core\Game;
use CreatureConforts\Core\Notifications;
use CreatureConforts\Managers\Conforts;
use CreatureConforts\Managers\Dice;
use CreatureConforts\Managers\Travelers;

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
}
