<?php

namespace CreatureComforts\Traits;

use BgaUserException;
use CreatureComforts\Core\Game;
use CreatureComforts\Core\Globals;
use CreatureComforts\Core\Notifications;
use CreatureComforts\Core\Score;
use CreatureComforts\Managers\Comforts;
use CreatureComforts\Managers\Cottages;
use CreatureComforts\Managers\Dice;
use CreatureComforts\Managers\Improvements;
use CreatureComforts\Managers\Players;
use CreatureComforts\Managers\Travelers;
use CreatureComforts\Managers\Valleys;

trait Debug {

    // function setup() {
    //     self::DbQuery("DELETE FROM comfort");
    //     self::DbQuery("DELETE FROM improvement");
    //     self::DbQuery("DELETE FROM traveler");
    //     self::DbQuery("DELETE FROM valley");
    //     Improvements::setup();
    //     Comforts::setup();
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
        Game::undoSavepoint();
    }

    function addColumn() {
        self::DbQuery('ALTER TABLE `player` ADD `almanac` smallint UNSIGNED NOT NULL DEFAULT 0');
        self::DbQuery('ALTER TABLE `player` ADD `wheelbarrow` smallint UNSIGNED NOT NULL DEFAULT 0');
    }

    function score() {
        var_dump(Score::getScore($this->getCurrentPlayerId()));
    }

    function next() {
        Game::get()->gamestate->jumpToState(ST_FAMILY_DICE);
    }

    function saveWhiteDice() {
        Dice::saveWhiteDice();
    }

    function getWhiteDice() {
        var_dump(Globals::getWhiteDice());
    }

    function removeWheel() {
        $sql = "DELETE FROM global_variables WHERE name like 'wheelbarrow__%'";
        self::DbQuery($sql);
    }
}