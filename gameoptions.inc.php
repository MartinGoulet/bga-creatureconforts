<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * CreatureConforts implementation : © Martin Goulet <martin.goulet@live.ca>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * gameoptions.inc.php
 *
 * CreatureConforts game options description
 * 
 * In this file, you can define your game options (= game variants).
 *   
 * Note: If your game has no variant, you don't have to modify this file.
 *
 * Note²: All options defined in this file should have a corresponding "game state labels"
 *        with the same ID (see "initGameStateLabels" in creatureconforts.game.php)
 *
 * !! It is not a good idea to modify this file when a game is running !!
 *
 */

 require_once("modules/php/constants.inc.php");

$game_options = [
    OPTION_SHORT_GAME_ID => [
        'name' => totranslate('Short game'),
        'values' => [
            OPTION_SHORT_GAME_ENABLED => [
                'name' => totranslate('Enabled'),
                'tmdisplay' => totranslate('Short game'),
                'description' => totranslate('2 cards for Spring, Summer and Fall'),
            ],
            OPTION_SHORT_GAME_DISABLED => [
                'name' => totranslate('Disabled'),
                'description' => totranslate('3 cards for Spring and Summer, 2 cards for Fall'),
            ],
        ],
    ],
];
