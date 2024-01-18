<?php

namespace CreatureComforts\Traits;

use CreatureComforts\Core\Game;

trait Debug {

    function setupTravelers() {
        Game::get()->travelers->moveCard(14, 'deck', 13);
        // Game::get()->travelers->moveCard(4, 'deck', 0);
    }

    function setupImprovements() {
        Game::get()->improvements->moveCard(5, 'deck', 27);
        Game::get()->improvements->moveCard(4, 'deck', 2);
    }


    // function setupCottages() {
    //     self::DbQuery('DELETE FROM cottage');
    //     Cottages::setupNewGame(Game::get()->loadPlayersBasicInfos(), []);
    // }

    // function setupVar() {
    //     Game::get()->setGameStateInitialValue(VAR_RIVER_DIAL, 1);
    // }
    // function addResources(string $type, int $nbr) {
    //     $player_id = intval(Game::get()->getCurrentPlayerId());
    //     Players::addResources($player_id, [$type => $nbr]);
    // }

    // function debugSavepoint() {
    //     Game::undoSavepoint();
    // }

    // function addColumn() {
    //     self::DbQuery('ALTER TABLE `player` ADD `almanac` smallint UNSIGNED NOT NULL DEFAULT 0');
    //     self::DbQuery('ALTER TABLE `player` ADD `wheelbarrow` smallint UNSIGNED NOT NULL DEFAULT 0');
    // }

    // function score() {
    //     var_dump(Score::getScore($this->getCurrentPlayerId()));
    // }

    // function next() {
    //     Game::get()->gamestate->jumpToState(ST_FAMILY_DICE);
    // }

    // function saveWhiteDice() {
    //     Dice::saveWhiteDice();
    // }

    // function getWhiteDice() {
    //     var_dump(Globals::getWhiteDice());
    // }

    // function removeWheel() {
    //     $sql = "DELETE FROM global_variables WHERE name like 'wheelbarrow__%'";
    //     self::DbQuery($sql);
    // }
}