<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * CreatureComforts implementation : © Martin Goulet <martin.goulet@live.ca>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 * 
 * states.inc.php
 *
 * CreatureComforts game states description
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

$travelerStates = [
    ST_GRAY_WOLF => [
        "phase" => "1",
        "name" => "grayWolf",
        "descriptionmyturn" => clienttranslate('${you} must choose a face-up Comfort form the Owl\'s Nest'),
        "description" => clienttranslate('Waiting for others to choose a face-up Comfort form the Owl\'s Nest'),
        "type" => "argPlayer",
        "type" => "activeplayer",
        "possibleactions" => ["confirmGrayWolf"],
        "transitions" => ["" => ST_GRAY_WOLF_NEXT_PLAYER]
    ],

    ST_GRAY_WOLF_NEXT_PLAYER => [
        "phase" => "1",
        "name" => "grayWolfNextPlayer",
        "type" => "game",
        "action" => "stPlayerTurnNextTraveler",
        "transitions" => [
            "next" => ST_GRAY_WOLF,
            "end" => ST_FAMILY_DICE,
        ]
    ],

    ST_CANADA_LYNX => [
        "phase" => "1",
        "name" => "canadaLynx",
        "descriptionmyturn" => clienttranslate('${you} must pick 2 differents goods from the supply to give to ${otherplayer}'),
        "description" => clienttranslate('Waiting for ${actplayer} to pick 2 differents goods from the supply to give to ${otherplayer}'),
        "args" => "argCanadaLynx",
        "type" => "activeplayer",
        "possibleactions" => ["confirmCanadaLynx"],
        "transitions" => ["" => ST_CANADA_LYNX_NEXT_PLAYER]
    ],

    ST_CANADA_LYNX_NEXT_PLAYER => [
        "phase" => "1",
        "name" => "canadaLynxNextPlayer",
        "type" => "game",
        "action" => "stPlayerTurnNextTraveler",
        "transitions" => [
            "next" => ST_CANADA_LYNX,
            "end" => ST_FAMILY_DICE,
        ]
    ],

    ST_COMMON_RAVEN => [
        "phase" => "1",
        "name" => "commonRaven",
        "descriptionmyturn" => clienttranslate('${you} must place a ::coin:: in a location'),
        "description" => clienttranslate('${actplayer} must place a ::coin:: in a location'),
        "args" => "argCommonRaven",
        "type" => "activeplayer",
        "possibleactions" => ["confirmCommonRaven"],
        "transitions" => ["" => ST_COMMON_RAVEN_NEXT_PLAYER]
    ],

    ST_COMMON_RAVEN_NEXT_PLAYER => [
        "phase" => "1",
        "name" => "commonRavenNextPlayer",
        "type" => "game",
        "action" => "stPlayerTurnNextTraveler",
        "transitions" => [
            "next" => ST_COMMON_RAVEN,
            "end" => ST_FAMILY_DICE,
        ]
    ],

    ST_STRIPED_SKUNK => [
        "phase" => "5",
        "name" => "stripedSkunk",
        "descriptionmyturn" => clienttranslate('${you} may claim one Comfort from the discard pile'),
        "description" => clienttranslate('${actplayer} may claim one Comfort from the discard pile'),
        "type" => "activeplayer",
        "possibleactions" => ["confirmStripedSkunk", "pass"],
        "transitions" => [
            "next" => ST_PLAYER_TURN_RESOLVE,
            "pass" => ST_PLAYER_TURN_RESOLVE,
        ]
    ],

    ST_COMMON_LOON => [
        "phase" => "3",
        "name" => "commonLoon",
        "descriptionmyturn" => clienttranslate('${you} must place one ${_private.otherplayer}\'s worker on a location'),
        "description" => clienttranslate('Waiting for others to place a worker'),
        "args" => "argCommonLoon",
        "type" => "multipleactiveplayer",
        'action' => 'stMakeEveryoneActive',
        "possibleactions" => ["confirmPlacement", "cancelPlacement"],
        "transitions" => ["" => ST_COMMON_LOON_END]
    ],

    ST_COMMON_LOON_END => [
        "phase" => 3,
        "name" => "commonLoonEnd",
        "type" => "game",
        "action" => "stPlacementEnd",
        "transitions" => ["" => ST_PLACEMENT]
    ],
    ST_MOOSE => [
        "phase" => "6",
        "name" => "moose",
        "descriptionmyturn" => clienttranslate('${you} may gain ::story:: if you give a ::any:: to ${otherplayer}'),
        "description" => clienttranslate('Waiting for others to choose if they want to trade'),
        "args" => "argMoose",
        "type" => "activeplayer",
        "possibleactions" => ["confirmMoose"],
        "transitions" => ["" => ST_MOOSE_NEXT_PLAYER]
    ],

    ST_MOOSE_NEXT_PLAYER => [
        "phase" => "6",
        "name" => "mooseNextPlayer",
        "type" => "game",
        "action" => "stPlayerTurnNextTraveler",
        "transitions" => [
            "next" => ST_MOOSE,
            "end" => ST_PRE_UPKEEP,
        ]
    ],

    ST_WILD_TURKEY => [
        "phase" => "3",
        "name" => "wildTurkey",
        "descriptionmyturn" => clienttranslate('${you} may change one of your own Family dice to any result'),
        "description" => clienttranslate('Waiting for others to change on of their Family dice'),
        "type" => "multipleactiveplayer",
        'action' => 'stMakeEveryoneActive',
        'args' => 'argWildTurkey',
        "possibleactions" => ["confirmWildTurkey", "cancelWildTurkey"],
        "transitions" => ["" => ST_WILD_TURKEY_END]
    ],

    ST_WILD_TURKEY_END => [
        "phase" => 3,
        "name" => "wildTurkeyEnd",
        "type" => "game",
        "action" => "stWildTurkeyEnd",
        "transitions" => ["" => ST_PLACEMENT]
    ],

    ST_BLUE_JAY => [
        "phase" => "blueJay",
        "name" => "blueJay",
        "descriptionmyturn" => clienttranslate('${you} may resolve one Valley location of your choice'),
        "description" => clienttranslate('Waiting for others to choose their location'),
        "type" => "multipleactiveplayer",
        'action' => 'stMakeEveryoneActive',
        'args' => 'argBlueJay',
        "possibleactions" => ["confirmBlueJay", "cancelBlueJay"],
        "transitions" => ["" => ST_BLUE_JAY_END]
    ],

    ST_BLUE_JAY_END => [
        "phase" => "blueJay",
        "name" => "blueJayEnd",
        "type" => "game",
        "action" => "stBlueJayEnd",
        "transitions" => ["" => ST_PRE_UPKEEP]
    ],
];

$improvementStates = [
    ST_IMPROVEMENT_BICYCLE => [
        "phase" => "5",
        "name" => "bicycle",
        "descriptionmyturn" => clienttranslate('Bicycle : ${you} may move one of your workers to a different location'),
        "description" => clienttranslate('Bycicle : ${actplayer} may move one of his workers to a different location'),
        "type" => "activeplayer",
        "possibleactions" => ["confirmBicycle", "pass"],
        "transitions" => [
            "next" => ST_PLAYER_TURN_DICE,
            "pass" => ST_PLAYER_TURN_DICE,
        ]
    ],
];

$endGameStates = [
    ST_PRE_END_OF_GAME => [
        "name" => "preEndOfGame",
        "descriptionmyturn" => clienttranslate('${you} may store resources on your comfort\'s cards for bonus scoring'),
        "description" => clienttranslate('Waiting for others to store resources on their comfort\'s cards for bonus scoring'),
        "type" => "multipleactiveplayer",
        'action' => 'stMakeEveryoneActive',
        "possibleactions" => ["confirmStoreResource", "cancelStoreResource"],
        "transitions" => [
            "" =>  ST_PRE_END_OF_GAME_SCORING
        ],
    ],

    ST_PRE_END_OF_GAME_SCORING => [
        "name" => "endGameScore",
        "type" => "game",
        "action" => "stEndGameScore",
        "transitions" => [
            "" => ST_END_GAME,
        ]
    ],

];

$machinestates = $basicGameStates + $travelerStates + $improvementStates + $endGameStates + array(

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
        "phase" => 1,
        "name" => "newTraveler",
        "description" => "Step 1 : New Traveler",
        "type" => "game",
        "action" => "stNewTraveler",
        "transitions" => [
            "family" => ST_FAMILY_DICE,
            "gray_wolf" => ST_GRAY_WOLF,
            "common_raven" => ST_COMMON_RAVEN,
            "canada_lynx" => ST_CANADA_LYNX,
        ]
    ],

    ST_FAMILY_DICE => [
        "phase" => 2,
        "name" => "familyDice",
        "description" => "Step 2 : Family Dice",
        "type" => "game",
        "action" => "stFamilyDice",
        "transitions" => [
            "end" => ST_PLACEMENT,
            "common_loon" => ST_COMMON_LOON,
            "wild_turkey" => ST_WILD_TURKEY,
        ]
    ],

    ST_PLACEMENT => [
        "phase" => 3,
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
        "phase" => 3,
        "name" => "placementEnd",
        "type" => "game",
        "action" => "stPlacementEnd",
        "transitions" => ["" => ST_VILLAGE_DICE]
    ],

    ST_VILLAGE_DICE => [
        "phase" => 4,
        "name" => "villageDice",
        "type" => "game",
        "action" => "stVillageDice",
        "transitions" => ["" => ST_PLAYER_TURN_START]
    ],

    ST_PLAYER_TURN_START => [
        "phase" => "5a",
        "name" => "playerTurnStart",
        "type" => "game",
        "action" => "stPlayerTurnStart",
        "transitions" => [
            "next" => ST_PLAYER_TURN_DICE,
            "bicycle" => ST_IMPROVEMENT_BICYCLE,
        ]
    ],

    ST_PLAYER_TURN_DICE => [
        "phase" => "5b",
        "name" => "playerTurnDice",
        "descriptionmyturn" => clienttranslate('${you} must place your dices where your have workers'),
        "description" => clienttranslate('${actplayer} must place their dices'),
        "type" => "activeplayer",
        "possibleactions" => array("confirmPlayerDice"),
        "transitions" => [
            "" => ST_PLAYER_TURN_RESOLVE,
        ]
    ],

    ST_PLAYER_TURN_RESOLVE => [
        "phase" => "5c",
        "name" => "playerTurnResolve",
        "descriptionmyturn" => clienttranslate('${you} must resolve your workers or pass'),
        "description" => clienttranslate('${actplayer} must resolve their workers'),
        "args" => "argPlayerTurnResolve",
        "type" => "activeplayer",
        "possibleactions" => array("resolveWorker", "confirmResolveWorker", "undo"),
        "transitions" => [
            "undo" => ST_PLAYER_TURN_DICE,
            "next" => ST_PLAYER_TURN_RESOLVE,
            "end" => ST_PLAYER_RETURN_UNRESOLVED_WORKER,
            "striped_skunk" => ST_STRIPED_SKUNK,
        ]
    ],

    ST_PLAYER_RETURN_UNRESOLVED_WORKER => [
        "phase" => "5d",
        "name" => "playerReturnUnresolvedWorker",
        "type" => "game",
        "action" => "stPlayerReturnUnresolvedWorker",
        "transitions" => [
            "" => ST_PLAYER_TURN_CRAFT_CONFORT,
        ]
    ],

    ST_PLAYER_TURN_CRAFT_CONFORT => [
        "phase" => "5e",
        "name" => "playerTurnCraftConfort",
        "descriptionmyturn" => clienttranslate('${you} may craft any number of Comforts from your hand'),
        "description" => clienttranslate('${actplayer} may craft any number of Comforts'),
        "type" => "activeplayer",
        "possibleactions" => array("craftConfort", "passCraftConfort", "undo"),
        "transitions" => [
            "undo" => ST_PLAYER_TURN_DICE,
            "craft" => ST_PLAYER_TURN_CRAFT_CONFORT,
            "end" => ST_PLAYER_TURN_END,
        ]
    ],

    ST_PLAYER_TURN_END => [
        "phase" => "5f",
        "name" => "playerTurnEnd",
        "type" => "game",
        "action" => "stPlayerTurnEnd",
        "transitions" => [
            "discard" => ST_PLAYER_TURN_DISCARD,
            "next" => ST_PLAYER_TURN_NEXT
        ]
    ],

    ST_PLAYER_TURN_DISCARD => [
        "phase" => "5f",
        "name" => "playerTurnDiscard",
        "descriptionmyturn" => clienttranslate('${you} must discard card until you have 3 Comfort cards in your hand'),
        "description" => clienttranslate('${actplayer} must discard Comfort cards'),
        "args" => "argPlayerTurnDiscard",
        "type" => "activeplayer",
        "possibleactions" => array("discardConfort"),
        "transitions" => [
            "" => ST_PLAYER_TURN_NEXT,
        ]
    ],

    ST_PLAYER_TURN_NEXT => [
        "phase" => "5f",
        "name" => "playerTurnNext",
        "type" => "game",
        "action" => "stPlayerTurnNext",
        "transitions" => [
            "next" => ST_PLAYER_TURN_START,
            "end" => ST_PRE_UPKEEP
        ]
    ],

    ST_PRE_UPKEEP => [
        "phase" => 6,
        "name" => "preUpkeep",
        "type" => "game",
        "action" => "stPreUpkeep",
        "transitions" => [
            "moose" => ST_MOOSE,
            "blue_jay" => ST_BLUE_JAY,
            "upkeep" => ST_UPKEEP,
            "end" => ST_PRE_END_OF_GAME,
        ]
    ],

    ST_UPKEEP => [
        "phase" => 6,
        "name" => "upkeep",
        "description" => "Step 6 : Upkeep",
        "type" => "game",
        "action" => "stUpkeep",
        "transitions" => ["" => ST_NEW_TRAVELER]
    ],

);
