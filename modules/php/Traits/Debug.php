<?php

namespace CreatureConforts\Traits;

use CreatureConforts\Core\Game;
use CreatureConforts\Core\Notifications;
use CreatureConforts\Managers\Conforts;
use CreatureConforts\Managers\Cottages;
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


    function setupCottages() {
        self::DbQuery('DELETE FROM cottage');
        Cottages::setupNewGame(Game::get()->loadPlayersBasicInfos(), []);
    }

    function setupVar() {
        Game::get()->setGameStateInitialValue(VAR_RIVER_DIAL, 1);
    }
    function addResources(string $type, int $nbr) {
        $player_id = intval(Game::get()->getCurrentPlayerId());
        Players::addResources($player_id, [$type => $nbr]);
    }

    function debugSavepoint() {
        Game::get()->setGameStateInitialValue(VAR_SAVEPOINT_TRANSITION, 0);
        Game::get()->undoSavepoint();
    }

    function addColumn() {
        self::DbQuery('ALTER TABLE `improvement` ADD `card_owner` int(11) NULL');
    }
}