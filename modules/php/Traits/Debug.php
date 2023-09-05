<?php

namespace CreatureConforts\Traits;

use CreatureConforts\Core\Game;
use CreatureConforts\Managers\Conforts;
use CreatureConforts\Managers\Dice;
use CreatureConforts\Managers\Improvements;
use CreatureConforts\Managers\Players;
use CreatureConforts\Managers\Travelers;
use CreatureConforts\Managers\Valleys;

trait Debug {

    // function setup() {
    //     self::DbQuery("DELETE FROM confort");
    //     self::DbQuery("DELETE FROM improvement");
    //     self::DbQuery("DELETE FROM traveler");
    //     self::DbQuery("DELETE FROM valley");
    //     Improvements::setup();
    //     Conforts::setup();
    //     Travelers::setup();
    //     Valleys::setup();
    // }

    function setupDice() {
        Dice::setupNewGame([], []);
    }
    function setupVar() {
        Game::get()->setGameStateInitialValue(VAR_RIVER_DIAL, 1);
    }
    function addResource() {
        $player_id = intval(Game::get()->getCurrentPlayerId());
        Players::addResources($player_id, [STORY => 1]);
    }
}