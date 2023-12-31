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
 * creatureconforts.game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 *
 */

use CreatureComforts\Core\Game;
use CreatureComforts\Core\Globals;
use CreatureComforts\Core\Score;
use CreatureComforts\Managers\Comforts;
use CreatureComforts\Managers\Cottages;
use CreatureComforts\Managers\Dice;
use CreatureComforts\Managers\Improvements;
use CreatureComforts\Managers\Players;
use CreatureComforts\Managers\Travelers;
use CreatureComforts\Managers\Valleys;
use CreatureComforts\Managers\Worker;

$swdNamespaceAutoload = function ($class) {
    $classParts = explode('\\', $class);
    if ($classParts[0] == 'CreatureComforts') {
        array_shift($classParts);
        $file = dirname(__FILE__) . '/modules/php/' . implode(DIRECTORY_SEPARATOR, $classParts) . '.php';
        if (file_exists($file)) {
            require_once $file;
        } else {
            var_dump('Cannot find file : ' . $file);
        }
    }
};
spl_autoload_register($swdNamespaceAutoload, true, true);

require_once(APP_GAMEMODULE_PATH . 'module/table/table.game.php');
require_once('modules/php/constants.inc.php');

class CreatureConforts extends Table {
    use CreatureComforts\Traits\Actions;
    use CreatureComforts\Traits\Args;
    use CreatureComforts\Traits\Debug;
    use CreatureComforts\Traits\States;

    /** @var Deck */
    public $improvements;
    /** @var Deck */
    public $comforts;
    /** @var Deck */
    public $cottages;
    /** @var Deck */
    public $travelers;
    /** @var Deck */
    public $valleys;
    /** @var Deck */
    public $workers;

    /** @var array */
    public $confort_types;
    /** @var array */
    public $improvement_types;
    /** @var array */
    public $traveler_types;
    /** @var array */
    public $valley_types;

    /** @var array */
    public $resource_types;

    /** @var CreatureComforts */
    public static $instance = null;

    function __construct() {
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();

        self::initGameStateLabels(array(
            VAR_FIRST_PLAYER => 10,
            VAR_RIVER_DIAL => 11,
            VAR_SAVEPOINT_TRANSITION => 12,
            VAR_MARKET_USED => 13,

            OPTION_SHORT_GAME => OPTION_SHORT_GAME_ID,
            //    "my_first_global_variable" => 10,
            //    "my_second_global_variable" => 11,
            //      ...
            //    "my_first_game_variant" => 100,
            //    "my_second_game_variant" => 101,
            //      ...
        ));

        self::$instance = $this;

        $this->comforts = self::getNew("module.common.deck");
        $this->comforts->init("comfort");

        $this->cottages = self::getNew("module.common.deck");
        $this->cottages->init("cottage");

        $this->improvements = self::getNew("module.common.deck");
        $this->improvements->init("improvement");

        $this->travelers = self::getNew("module.common.deck");
        $this->travelers->init("traveler");

        $this->valleys = self::getNew("module.common.deck");
        $this->valleys->init("valley");

        $this->workers = self::getNew("module.common.deck");
        $this->workers->init("worker");
    }

    public static function get() {
        return self::$instance;
    }

    protected function getGameName() {
        // Used for translations and stuff. Please do not modify.
        return "creatureconforts";
    }

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame($players, $options = array()) {
        Players::setupNewGame($players, $options);
        Comforts::setupNewGame($players, $options);
        Cottages::setupNewGame($players, $options);
        Improvements::setupNewGame($players);
        Travelers::setupNewGame($players);
        Valleys::setupNewGame($options);
        Dice::setupNewGame($players, $options);
        Worker::setupNewGame();
        self::setGameStateInitialValue(VAR_RIVER_DIAL, bga_rand(1, 6));
        self::setGameStateInitialValue(VAR_MARKET_USED, 0);
        $this->activeNextPlayer();

        // Init game statistics
        self::initStat('table', STAT_TURN_NUMBER, 0);
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas() {
        $result = [];

        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!

        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT player_id id, player_score score, wood, stone, fruit, mushroom, yarn, grain, lesson, story, coin, almanac, wheelbarrow FROM player ";
        $result['players'] = self::getCollectionFromDb($sql);
        $result['first_player_id'] = intval(self::getGameStateValue(VAR_FIRST_PLAYER));
        $result['river_dial'] = intval(self::getGameStateValue(VAR_RIVER_DIAL));

        // TODO: Gather all information about current game situation (visible by player $current_player_id).
        $result['confort_types'] = $this->confort_types;
        $result['improvement_types'] = $this->improvement_types;
        $result['valley_types'] = $this->valley_types;

        $result['dice'] = Dice::getUIData();

        $result['comforts'] = Comforts::getUIData($current_player_id);
        $result['cottages'] = Cottages::getUIData();
        $result['improvements'] = Improvements::getUIData();
        $result['travelers'] = Travelers::getUIData();
        $result['valleys'] = Valleys::getUIData();
        $result['workers'] = Worker::getUIData();

        $result['wheelbarrows'] = [];
        foreach (self::loadPlayersBasicInfos() as $player_id => $player) {
            $wheelbarrow = Globals::getWheelbarrow($player_id);
            if ($wheelbarrow > 0) {
                $result['wheelbarrows'][] = $wheelbarrow;
            }
        }

        $result['debug_gv'] = self::getCollectionFromDB("SELECT * FROM global_variables");
        // $result['debug_cottage'] = self::getCollectionFromDB("SELECT * FROM cottage");
        $result['debug_valley'] = array_values(self::getCollectionFromDB("SELECT * FROM valley WHERE card_location != 'box' ORDER BY card_location, card_location_arg desc"));
        $result['debug_traveler'] = self::getCollectionFromDB("SELECT * FROM traveler");
        $result['debug_short_game'] = intval(self::getGameStateValue(OPTION_SHORT_GAME));
        $result['raven_location'] = Globals::getRavenLocationIds();

        $result['turn_number'] = self::getStat(STAT_TURN_NUMBER);
        $result['nbr_turns'] = Game::isShortGame() ? 6 : 8;

        if ($this->gamestate->state_id() == 99) {
            $result['scores'] = [];
            foreach (self::loadPlayersBasicInfos() as $player_id => $player) {
                $result['scores'][$player_id] = Score::getScore(intval($player_id));
            }
        }

        $result['comfort_resources'] = Globals::getComfortResourceByCard();

        return $result;
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression() {
        // TODO: compute and return the game progression

        return 0;
    }


    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////    

    /*
        In this space, you can put any utility methods useful for your game logic
    */

    /**
     * Returns an array of user preference colors to game colors.
     * Game colors must be among those which are passed to reattributeColorsBasedOnPreferences()
     * Each game color can be an array of suitable colors, or a single color:
     * [
     *    // The first available color chosen:
     *    'ff0000' => ['990000', 'aa1122'],
     *    // This color is chosen, if available
     *    '0000ff' => '000099',
     * ]
     * If no color can be matched from this array, then the default implementation is used.
     */
    function getSpecificColorPairings(): array {
        return array(
            "ff0000" /* Red */         => "b7313e",
            "008000" /* Green */       => "13586b",
            "0000ff" /* Blue */        => "13586b",
            "ffa500" /* Yellow */      => "dcac28",
            "000000" /* Black */       => null,
            "ffffff" /* White */       => null,
            "e94190" /* Pink */        => null,
            "982fff" /* Purple */      => "650e41",
            "72c3b1" /* Cyan */        => null,
            "f07f16" /* Orange */      => null,
            "bdd002" /* Khaki green */ => null,
            "7b7b7b" /* Gray */        => "7e797b",
        );
    }

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in creatureconforts.action.php)
    */

    /*
    
    Example:

    function playCard( $card_id )
    {
        // Check that this is the player's turn and that it is a "possible action" at this game state (see states.inc.php)
        self::checkAction( 'playCard' ); 
        
        $player_id = self::getActivePlayerId();
        
        // Add your game logic to play a card there 
        ...
        
        // Notify all players about the card played
        self::notifyAllPlayers( "cardPlayed", clienttranslate( '${player_name} plays ${card_name}' ), array(
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'card_name' => $card_name,
            'card_id' => $card_id
        ) );
          
    }
    
    */


    //////////////////////////////////////////////////////////////////////////////
    //////////// Game state arguments
    ////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    /*
    
    Example for game state "MyGameState":
    
    function argMyGameState()
    {
        // Get some values from the current game situation in database...
    
        // return values:
        return array(
            'variable1' => $value1,
            'variable2' => $value2,
            ...
        );
    }    
    */

    //////////////////////////////////////////////////////////////////////////////
    //////////// Game state actions
    ////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    /*
    
    Example for game state "MyGameState":

    function stMyGameState()
    {
        // Do some stuff ...
        
        // (very often) go to another gamestate
        $this->gamestate->nextState( 'some_gamestate_transition' );
    }    
    */

    //////////////////////////////////////////////////////////////////////////////
    //////////// Zombie
    ////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    function zombieTurn($state, $active_player) {
        $statename = $state['name'];

        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                default:
                    $this->gamestate->nextState("zombiePass");
                    break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive($active_player, '');

            return;
        }

        throw new feException("Zombie mode not supported at this game state: " . $statename);
    }

    ///////////////////////////////////////////////////////////////////////////////////:
    ////////// DB upgrade
    //////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */

    function upgradeTableDb($from_version) {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345

        // Example:
        //        if( $from_version <= 1404301345 )
        //        {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
        //            self::applyDbUpgradeToAllDB( $sql );
        //        }
        //        if( $from_version <= 1405061421 )
        //        {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
        //            self::applyDbUpgradeToAllDB( $sql );
        //        }
        //        // Please add your future database scheme changes here
        //
        //


    }
}
