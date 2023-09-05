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
 * states.inc.php
 *
 * CreatureConforts game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!

$basicGameStates = [

    // The initial state. Please do not modify.
    ST_BGA_GAME_SETUP => [
        "name" => "gameSetup",
        "description" => clienttranslate("Game setup"),
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => ["" => ST_START_HAND]
    ],

    // Final state.
    // Please do not modify.
    ST_END_GAME => [
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd",
    ],
];

$machinestates = $basicGameStates + array(

    ST_START_HAND => [
        "name" => "startHand",
        "descriptionmyturn" => clienttranslate('${you} must discard 1 card'),
        "description" => clienttranslate('Waiting for others to choose the card to discard'),
        "type" => "multipleactiveplayer",
        'action' => 'stMakeEveryoneActive',
        'args' => 'argStartHandDiscard',
        "possibleactions" => ["discardStartHand", "cancelStartHand"],
        "transitions" => ["" =>  ST_START_HAND_DISCARD],
    ],

    ST_START_HAND_DISCARD => [
        "name" => "startHandDiscard",
        "type" => "game",
        "action" => "stStartHandDiscard",
        "transitions" => ["" => ST_NEW_TRAVELER]
    ],

    ST_NEW_TRAVELER => [
        "name" => "newTraveler",
        "type" => "game",
        "action" => "stNewTraveler",
        "transitions" => ["" => ST_FAMILY_DICE]
    ],

    ST_FAMILY_DICE => [
        "name" => "familyDice",
        "type" => "game",
        "action" => "stFamilyDice",
        "transitions" => ["" => ST_PLACEMENT]
    ],

    ST_PLACEMENT => [
        "name" => "placement",
        "descriptionmyturn" => clienttranslate('${you} must place your workers'),
        "description" => clienttranslate('Waiting for others to place their workers'),
        "type" => "multipleactiveplayer",
        'action' => 'stMakeEveryoneActive',
        'args' => 'argPlacement',
        "possibleactions" => ["confirmPlacement", "cancelPlacement"],
        "transitions" => ["" => ST_PLACEMENT_END]
    ],

    ST_PLACEMENT_END => [
        "name" => "placementEnd",
        "type" => "game",
        "action" => "stPlacementEnd",
        "transitions" => ["" => ST_VILLAGE_DICE]
    ],

    ST_VILLAGE_DICE => [
        "name" => "villageDice",
        "type" => "game",
        "action" => "stVillageDice",
        "transitions" => ["" => ST_PLAYER_TURN_START]
    ],

    ST_PLAYER_TURN_START => [
        "name" => "playerTurnStart",
        "type" => "game",
        "action" => "stPlayerTurnStart",
        "transitions" => ["" => ST_PLAYER_TURN_DICE]
    ],

    ST_PLAYER_TURN_DICE => [
        "name" => "playerTurnDice",
        "description" => clienttranslate('${actplayer} must place your dices where your have workers'),
        "descriptionmyturn" => clienttranslate('${you} must place their dices'),
        "type" => "activeplayer",
        "possibleactions" => array("confirmPlayerDice"),
        "transitions" => [
            "" => ST_PLAYER_TURN_RESOLVE,
        ]
    ],

    ST_PLAYER_TURN_RESOLVE => [
        "name" => "playerTurnResolve",
        "description" => clienttranslate('${actplayer} must resolve your workers'),
        "descriptionmyturn" => clienttranslate('${you} must resolve their workers'),
        "type" => "activeplayer",
        "possibleactions" => array("resolveWorker", "confirmPlayerTurn"),
        "transitions" => [
            "next" => ST_PLAYER_TURN_RESOLVE,
            "end" => ST_PLAYER_TURN_CRAFT_CONFORT,
        ]
    ],

    ST_PLAYER_TURN_CRAFT_CONFORT => [
        "name" => "playerTurnCraftConfort",
        "description" => clienttranslate('${actplayer} may craft any number of Conforts'),
        "descriptionmyturn" => clienttranslate('${you} may craft any number of Conforts from your hand'),
        "type" => "activeplayer",
        "possibleactions" => array("craftConfort", "passCraftConfort"),
        "transitions" => [
            "craft" => ST_PLAYER_TURN_CRAFT_CONFORT,
            "end" => ST_PLAYER_TURN_END,
        ]
    ],

    ST_PLAYER_TURN_END => [
        "name" => "playerTurnEnd",
        "type" => "game",
        "action" => "stPlayerTurnEnd",
        "transitions" => [
            "discard" => ST_PLAYER_TURN_DISCARD,
            "next" => ST_PLAYER_TURN_NEXT
        ]
    ],

    ST_PLAYER_TURN_NEXT => [
        "name" => "playerTurnNext",
        "type" => "game",
        "action" => "stPlayerTurnNext",
        "transitions" => [
            "next" => ST_PLAYER_TURN_START,
            "end" => ST_UNKEEP
        ]
    ],

    ST_UNKEEP => [
        "name" => "unkeep",
        "type" => "game",
        "action" => "stUnkeep",
        "transitions" => ["" => ST_PLAYER_TURN_NEXT]
    ],

);
