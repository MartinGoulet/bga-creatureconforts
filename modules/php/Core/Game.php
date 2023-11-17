<?php

namespace CreatureConforts\Core;

/*
 * Game: a wrapper over table object to allow more generic modules
 */

class Game extends \APP_DbObject {
    public static function get() {
        return \CreatureConforts::get();
    }

    public static function undoSavepoint() {
        self::get()->undoSavepoint();
        $stateNum = Game::get()->gamestate->state_id();
        self::get()->setGameStateValue(VAR_SAVEPOINT_TRANSITION, $stateNum);
    }

    public static function undoRestorePoint() {
        self::get()->undoRestorePoint();
        $stateNum = intval(self::get()->getGameStateValue(VAR_SAVEPOINT_TRANSITION));
        self::get()->gamestate->jumpToState($stateNum);
    }

    public static function isShortGame() {
        $gameOption = intval(Game::get()->getGameStateValue(OPTION_SHORT_GAME));
        $isShortGame = $gameOption === OPTION_SHORT_GAME_ENABLED;
        return $isShortGame;
    }
}
