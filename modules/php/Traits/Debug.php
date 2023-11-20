<?php

namespace CreatureConforts\Traits;

use BgaUserException;
use CreatureConforts\Core\Game;
use CreatureConforts\Core\Notifications;
use CreatureConforts\Core\Score;
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
}