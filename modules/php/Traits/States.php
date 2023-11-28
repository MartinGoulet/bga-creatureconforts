<?php

namespace CreatureConforts\Traits;

use CreatureConforts\Core\Game;
use CreatureConforts\Core\Globals;
use CreatureConforts\Core\Notifications;
use CreatureConforts\Core\Score;
use CreatureConforts\Helpers\TravelerHelper;
use CreatureConforts\Managers\Conforts;
use CreatureConforts\Managers\Dice;
use CreatureConforts\Managers\Improvements;
use CreatureConforts\Managers\Players;
use CreatureConforts\Managers\Travelers;
use CreatureConforts\Managers\Valleys;
use CreatureConforts\Managers\Worker;

trait States {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Game state actions
    ////////////

    function stStartHandDiscard() {
        $discarded_cards = Conforts::discardStartHand();
        Notifications::discardStartHand($discarded_cards);
        Game::get()->gamestate->nextState();
    }

    function stNewTraveler() {
        Game::get()->incStat(1, STAT_TURN_NUMBER);
        $turn_number = Game::get()->getStat(STAT_TURN_NUMBER);

        Notifications::newTurn($turn_number);

        $isFirstTurn = $turn_number == 1;
        if (!$isFirstTurn) {
            Travelers::discardTopCard();
        }
        Notifications::newTraveler();

        $players = Game::get()->loadPlayersBasicInfos();
        foreach ($players as $player_id => $player) {
            Globals::setWorkerPlacement(intval($player_id), []);
        }

        if (TravelerHelper::isActiveGrayWolf()) {
            Game::get()->gamestate->nextState("gray_wolf");
        } else if (TravelerHelper::isActiveCommonRaven()) {
            Game::get()->gamestate->nextState("common_raven");
        } else if (TravelerHelper::isActiveCanadaLynx()) {
            Game::get()->gamestate->nextState("canada_lynx");
        } else {
            Game::get()->gamestate->nextState("family");
        }
    }

    function stFamilyDice() {
        Dice::throwPlayerDice();

        $players = Game::get()->loadPlayersBasicInfos();
        foreach ($players as $player_id => $player) {
            Notifications::familyDice(intval($player_id), Dice::getDiceFromPlayer(intval($player_id)));
        }

        if (TravelerHelper::isActiveCommonLoon()) {
            Game::get()->gamestate->nextState('common_loon');
        } else if (TravelerHelper::isActiveWildTurkey()) {
            Game::get()->gamestate->nextState('wild_turkey');
        } else {
            Game::get()->gamestate->nextState('end');
        }
    }

    function stPlacementEnd() {
        $players = Game::get()->loadPlayersBasicInfos();
        $prevTable = Game::get()->getPrevPlayerTable();

        foreach ($players as $player_id => $player) {
            $locations = Globals::getWorkerPlacement($player_id);
            $pId = $player_id;
            if (Game::get()->gamestate->state_id() == ST_COMMON_LOON_END) {
                $pId = $prevTable[$pId];
            }
            $workers = array_values(Worker::getWorkersFromPlayer($pId));
            $workers = array_filter($workers, fn ($w) => $w['location'] == "player");

            foreach ($locations as $location) {
                $worker = array_shift($workers);
                Worker::moveToLocation($worker['id'], $location);
            }
            Globals::setWorkerPlacement($player_id, []);
        }

        Notifications::revealPlacement(Worker::getUIData());
        Game::get()->gamestate->nextState();
    }

    function stVillageDice() {
        Dice::throwWhiteDice();
        Notifications::villageDice(Dice::getWhiteDice());
        Game::get()->gamestate->nextState();
    }

    function stPlayerTurnStart() {
        $player_id = $this->getActivePlayerId();
        Dice::movePlayerDiceToHill($player_id);

        $dice = Dice::getDiceFromPlayer($player_id);
        Notifications::moveDiceToHill($dice);
        Game::undoSavepoint();

        Globals::setMarketUsed(false);
        $next_state = Improvements::hasBicycle(Players::getPlayerId()) ? "bicycle" : "next";
        Game::get()->gamestate->nextState($next_state);
    }

    function stPlayerReturnUnresolvedWorker() {
        $player_id = Players::getPlayerId();
        $workers = Worker::getWorkersFromPlayer($player_id);
        foreach ($workers as $worker) {
            $location_id = intval($worker['location_arg']);
            if ($location_id > 0) {
                Worker::returnToPlayerBoard($player_id, $location_id);
                Notifications::returnToPlayerBoard($worker);
                if ($location_id == 8 && Globals::getMarketUsed()) {
                    // do nothing
                } else {
                    Players::addResources($player_id, [LESSON_LEARNED => 1]);
                    Notifications::getResourcesFromLocation($player_id, $location_id, [LESSON_LEARNED => 1]);
                }
            }
        }
        Game::get()->gamestate->nextState();
    }

    function stPlayerTurnEnd() {
        $player_id = $this->getActivePlayerId();
        // Return dices
        Dice::moveWhiteDiceToHill();
        Dice::movePlayerDiceToBoard($player_id);

        Notifications::returnDice($player_id, Dice::getUIData());

        $next_state = sizeof(Conforts::getHand($player_id)) > 3 ? 'discard' : 'next';
        Game::get()->gamestate->nextState($next_state);
    }

    function stPlayerTurnNext() {
        $current_player_id = $this->getActivePlayerId();
        $next_player_id = intval(Game::get()->getNextPlayerTable()[$current_player_id]);
        if ($next_player_id == Globals::getFirstPlayerId()) {
            // All player has played their turn
            Game::get()->gamestate->nextState('end');
        } else {
            Game::get()->giveExtraTime($current_player_id);
            Game::get()->activeNextPlayer();
            Game::get()->gamestate->nextState('next');
        }
    }

    function stPlayerTurnNextTraveler() {
        $current_player_id = $this->getActivePlayerId();
        $next_player_id = intval(Game::get()->getNextPlayerTable()[$current_player_id]);
        Game::get()->giveExtraTime($current_player_id);
        Game::get()->activeNextPlayer();
        if ($next_player_id == Globals::getFirstPlayerId()) {
            // All player has played their turn
            Game::get()->gamestate->nextState('end');
        } else {
            Game::get()->gamestate->nextState('next');
        }
    }

    function stPreUpkeep() {
        $gameOption = intval(Game::get()->getGameStateValue(OPTION_SHORT_GAME));
        $isShortGame = $gameOption === OPTION_SHORT_GAME_ENABLED;

        $turn_number = intval(Game::get()->getStat(STAT_TURN_NUMBER));
        $last_turn_number = $isShortGame ? 6 : 8;

        if ($turn_number === $last_turn_number) {
            Game::get()->gamestate->nextState('end');
        } else {
            Game::get()->gamestate->nextState('upkeep');
        }
    }

    function stUpkeep() {

        Globals::setRavenLocationIds([]);

        // Discard the top Forest and Meadow cards on the Valley stacks from the game,
        // revealing the new ones for the upcoming month and progressing further
        // through the seasons.

        Valleys::nextSeason();
        $info = Valleys::getUIData();
        Notifications::newSeason($info);

        // TODO : Verification for winter
        if ($info[FOREST]['count'] == 0) {
            Game::get()->gamestate->nextState('end');
            return;
        }

        // 1. Rotate the River dial one notch clockwise.
        $next_value =  Globals::getRiverDialValue() == 1 ? 6 : Globals::getRiverDialValue() - 1;
        Globals::setRiverDialValue($next_value);
        Notifications::riverDialRotate($next_value);

        // 2. Discard the leftmost Comfort from the Owl’s Nest, slide the other three
        // cards one slot left, and deal a new Comfort from the deck face up into the
        // empty rightmost slot.
        $discard = Conforts::discardLeftMostOwlNest();
        Conforts::refillOwlNest();
        Notifications::refillOwlNest(Conforts::getOwlNest(), $discard);

        // Discard the Improvement in the bottom ladder slot from the Workshop,
        // then slide the five remaining Improvements down a slot and deal a new
        // Improvement from the deck face up into the top slot.
        $discard = Improvements::discardBottomLadder();
        $shuffled = Improvements::refillLadder();
        Notifications::refillLadder(Improvements::getLadder(), $shuffled, $discard);

        // 3. Discard the Traveler from the Inn.
        Travelers::discardTopCard();
        Notifications::discardTraveler();

        // 4. The Early Bird passes the Worm clockwise. That player is the new Early
        // Bird. The Early Bird takes the Village dice to roll later.
        $active_player_id = intval($this->getActivePlayerId());
        Globals::setFirstPlayerId($active_player_id);
        Notifications::newFirstPlayer($active_player_id);

        // Start the new month with Step 1: New Traveler.
        Game::get()->gamestate->nextState();
    }

    function stEndGameScore() {
        $players = Game::get()->loadPlayersBasicInfos();
        $scores = [];
        foreach ($players as $player_id => $player) {
            $score = Score::getScore(intval($player_id));
            $sum = array_sum($score);
            Players::setPlayerScore($player_id, $sum);
            $score['total'] = $sum;
            $scores[$player_id] = $score;
        }
        Notifications::finalScoring($scores);
        Game::get()->gamestate->nextState();
    }

    function stWildTurkeyEnd() {
        $players = Game::get()->loadPlayersBasicInfos();

        foreach($players as $player_id => $player) {
            $dice_info = Globals::getWildTurkeyDice($player_id);
            if($dice_info['die_id'] > 0) {
                $die = Dice::get($dice_info['die_id']);
                Dice::updateDieValue($dice_info['die_id'], $dice_info['die_value']);
                Notifications::modifyDieWithWildTurkey($player_id, $die , $dice_info['die_value']);
            }
        }

        Game::get()->gamestate->nextState();
    }
}
