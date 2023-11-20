<?php

namespace CreatureConforts\Core;

use BgaSystemException;
use CreatureConforts\Managers\Conforts;
use CreatureConforts\Managers\Improvements;
use CreatureConforts\Managers\Players;
use CreatureConforts\Managers\Travelers;

class Notifications extends \APP_DbObject {

    static function addConfortToHand(int $player_id, array $card) {
        $message = clienttranslate('${player_name} get ${card_name} from the Owl\'s nest');
        $card_args = self::getConfortCardArgs($card, $player_id);
        self::notifyAll('onAddConfortToHand', $message, $card_args);
    }

    static function addAlmanac(int $player_id) {
        $message = clienttranslate('${player_name} receives ${token}');
        self::notifyAll('onAddAlmanac', $message, [
            'player_id' => $player_id,
            'player_name' => self::getPlayerName($player_id),
            'token' => 'almanac',
        ]);
    }

    static function addWheelbarrow(int $player_id) {
        $message = clienttranslate('${player_name} receives ${token}');
        self::notifyAll('onAddWheelbarrow', $message, [
            'player_id' => $player_id,
            'player_name' => self::getPlayerName($player_id),
            'token' => 'wheelbarrow',
        ]);
    }

    static function buildImprovement(int $player_id, array $card, array $cost, array $cottage) {
        $message = clienttranslate('${player_name} spend ${resources_to} to build ${card_name} from the workshop');
        self::notifyAll('onBuildImprovement', $message, [
            'player_id' => $player_id,
            'player_name' => self::getPlayerName($player_id),
            'card' => $card,
            'cost' => $cost,
            'resources_to' => $cost,
            'cottage' => $cottage,
            'card_name' => Improvements::getName($card),
            "i18n" => ["card_name"],
        ]);
    }

    static function craftConfort(int $player_id, array $card, array $cost) {
        $message = clienttranslate('${player_name} spends ${resources_to} to craft ${card_name}');

        self::notifyAll('onCraftConfort', $message, [
            'player_id' => $player_id,
            'player_name' => self::getPlayerName($player_id),
            'card' => $card,
            'cost' => $cost,
            'card_name' => Conforts::getName($card),
            'resources_to' => $cost,
            'i18n' => ['card_name'],
        ]);
    }

    static function discardConfort(array $cards_before) {
        self::discardStartHand($cards_before);
    }

    static function discardStartHand(array $cards_before) {
        $message = clienttranslate('${player_name} discards ${card_name}');

        $cards = array_values(array_map(function ($card) {
            $newCard = Conforts::get($card['id']);
            $newCard['player_id'] = $card['location_arg'];
            return $newCard;
        }, $cards_before));

        usort($cards, function ($a, $b) {
            return $a['location_arg'] > $b['location_arg'];
        });

        foreach ($cards as $card) {
            $player_id = intval($card['player_id']);
            self::notifyAll('onDiscardStartHand', $message, [
                'player_id' => $player_id,
                'player_name' => self::getPlayerName($player_id),
                'card' => $card,
                'card_name' => Conforts::getName($card),
                'i18n' => ['card_name'],
            ]);
        }
    }

    static function discardTraveler() {
        self::notifyAll('onDiscardTraveler', '', []);
    }

    static function drawConfort(int $player_id, array $cards) {
        $args = [
            'player_id' => $player_id,
            'player_name' => self::getPlayerName($player_id),
            'nbr_cards' => count($cards)
        ];
        $message = clienttranslate('${player_name} draws ${nbr_cards}');
        self::notifyAll('message', $message, $args, $player_id);

        $message = clienttranslate('${player_name} draws ${card_name}');
        foreach ($cards as $card_id => $card) {
            $card_args = self::getConfortCardArgs($card, $player_id);
            self::notify($player_id, 'onDrawConfort', $message, $card_args);

            $card_args = self::getConfortCardOtherArgs($card, $player_id);
            self::notifyAll('onDrawConfort', '', $card_args, $player_id);
        }
    }

    static function familyDice(int $player_id, array $dice) {
        $message = clienttranslate('${player_name} rolls dice ${rolledDice}');
        self::notifyAll('onFamilyDice', $message, [
            'player_id' => $player_id,
            'player_name' => self::getPlayerName($player_id),
            'dice' => $dice,
            'rolledDice' => implode(',', array_column($dice, 'face')),
        ]);
    }

    static function finalScoring($scores) {
        self::notifyAll('onFinalScoring', '', [
            "scores" => $scores,
        ]);
    }

    static function getResourcesFromLocation(int $player_id, int $location_id, array $resources) {
        $message = clienttranslate('${player_name} get ${resources_to} from a location');
        self::notifyAll('onGetResourcesFromLocation', $message, [
            'player_id' => Players::getPlayerId(),
            'player_name' => self::getPlayerName(Players::getPlayerId()),
            'location_id' => $location_id,
            'resources' => $resources,
            'resources_to' => $resources,
        ]);
    }

    static function modifyDieWithLessonLearned(int $player_id, array $die, int $new_value, $nbr_lesson, $nbr_umbrella) {
        $message = clienttranslate('${player_name} uses ${resources_to} to change ${die_from} for ${die_to}');
        $new_dice = $die;
        $new_dice['face'] = $new_value;
        self::notifyAll('onModifyDieWithLessonLearned', $message, [
            'player_id' => $player_id,
            'player_name' => self::getPlayerName($player_id),
            'die_from' => intval($die['face']),
            'die_to' => $new_value,
            'die_color' => $die['type'],
            'nbr_lesson' => $nbr_lesson,
            'resources_to' => [
                LESSON_LEARNED => $nbr_lesson,
                'umbrella' => $nbr_umbrella
            ],
        ]);
    }

    static function modifyDieWithWildTurkey(int $player_id, array $die, int $new_value) {
        $message = clienttranslate('${player_name} uses ${card_name} to change ${die_from} for ${die_to}');
        $new_dice = $die;
        $new_dice['face'] = $new_value;
        self::notifyAll('onModifyDieWithWildTurkey', $message, [
            'player_id' => $player_id,
            'player_name' => self::getPlayerName($player_id),
            'die_from' => intval($die['face']),
            'die_to' => $new_value,
            'die_color' => $die['type'],
            'die_val_id' => intval($die['id']),
            'die_val_to' => intval($new_value),
            'card_name' => _("Wild turkey"),
            "i18n" => ["card_name"],
            'preserve' => ['die_from', 'die_to', 'die_color']
        ]);
    }

    static function newRavenLocationTaken(int $location_id) {
        self::notifyAll('onNewRavenLocationTaken', '', [
            'location_id' => $location_id,
        ]);
    }

    static function newTraveler() {
        $message = clienttranslate('${card_name} is revealed as the new traveler');
        $info = Travelers::getUIData();

        self::notifyAll('onNewTraveler', $message, [
            'card' => $info['topCard'],
            'count' => $info['count'],
            'card_name' => Travelers::getName($info['topCard']),
            'i18n' => ['card_name'],
        ]);
    }

    static function newTurn($turn_number) {
        $message = clienttranslate('Turn ${turn_number}');
        self::notifyAll('onNewTurn', $message, ['turn_number' => $turn_number]);
    }

    static function returnDice(int $player_id, array $dice) {
        self::notifyAll('onReturnDice', '', [
            'player_id' => $player_id,
            'dice' => array_values($dice),
        ]);
    }

    static function returnFamilyDie(int $player_id, array $die) {
        self::notifyAll('onReturnFamilyDie', '', [
            'player_id' => $player_id,
            'die' => $die,
        ]);
    }

    static function revealPlacement($workers) {
        self::notifyAll('onRevealPlacement', '', [
            'workers' => $workers,
        ]);
    }

    static function moveDiceToHill($dice) {
        self::notifyAll('onMoveDiceToHill', '', [
            'dice' => $dice,
        ]);
    }

    static function moveDiceToLocation($dice) {
        self::notifyAll('onMoveDiceToLocation', '', [
            'dice' => $dice,
        ]);
    }

    static function newFirstPlayer(int $player_id) {
        $message = clienttranslate('${player_name} get the worm and is now the new first player for the turn');
        self::notifyAll('onNewFirstPlayer', $message, [
            'player_id' => $player_id,
            'player_name' => self::getPlayerName($player_id),
        ]);
    }

    static function newSeason($info) {
        self::notifyAll('onNewSeason', '', [
            'info' => $info,
        ]);
    }

    static function refillLadder(array $ladder, $shuffled = false, $discard = null) {
        $message = $shuffled 
            ? clienttranslate('The improvement deck is reshuffled because it is empty"') 
            : '';
        self::notifyAll('onRefillLadder', $message, [
            'ladder' => $ladder,
            'discard' => $discard,
            'shuffled' => $shuffled,
            'cards' => $shuffled ? Improvements::getDeck() : [],
        ]);
    }

    static function refillOwlNest(array $owl_nest, array $discard = null) {
        self::notifyAll('onRefillOwlNest', '', [
            'owl_nest' => $owl_nest,
            'discard' => $discard,
        ]);
    }

    static function returnToPlayerBoard($worker) {
        self::notifyAll('onReturnWorkerToPlayerBoard', '', [
            'player_id' => intval($worker['type_arg']),
            'worker' => $worker,
        ]);
    }

    static function riverDialRotate($newValue) {
        self::notifyAll('onRiverDialRotate', '', [
            'value' => $newValue,
        ]);
    }

    static function marketExchangeResources($resources_from, $resources_to) {
        $message = clienttranslate('${player_name} use the market to exchange ${resources_from} for ${resources_to}');
        self::notifyAll('onMarketExchangeResources', $message, [
            'player_id' => Players::getPlayerId(),
            'player_name' => self::getPlayerName(Players::getPlayerId()),
            'resources_from' => $resources_from,
            'resources_to' => $resources_to,
            'from' => $resources_from,
            'to' => $resources_to,
        ]);
    }

    static function travelerExchangeResources($resources_from, $resources_to) {
        $message = clienttranslate('${player_name} use the traveler to exchange ${resources_from} for ${resources_to}');
        self::notifyAll('onTravelerExchangeResources', $message, [
            'player_id' => Players::getPlayerId(),
            'player_name' => self::getPlayerName(Players::getPlayerId()),
            'resources_from' => $resources_from,
            'resources_to' => $resources_to,
            'from' => $resources_from,
            'to' => $resources_to,
        ]);
    }

    static function travelerReceivedResources($resources_to) {
        $message = clienttranslate('${player_name} receives ${resources_to} from the traveler');
        self::notifyAll('onTravelerExchangeResources', $message, [
            'player_id' => Players::getPlayerId(),
            'player_name' => self::getPlayerName(Players::getPlayerId()),
            'resources_to' => $resources_to,
            'from' => [],
            'to' => $resources_to,
        ]);
    }

    static function villageDice($dice) {
        $message = clienttranslate('${player_name} rolls dice ${rolledDice}');
        $player_id = Globals::getFirstPlayerId();
        self::notifyAll('onVillageDice', $message, [
            'player_id' => $player_id,
            'player_name' => self::getPlayerName($player_id),
            'dice' => $dice,
            'rolledDice' => implode(',', array_column($dice, 'face')),
        ]);
    }

    static function pass($player_id) {
        $message = clienttranslate('${player_name} passes');
        self::message($message, [
            'player_name' => self::getPlayerName($player_id),
        ]);
    }

    /**************************
     **** TRAVELER ABILITY ****
     **************************/

    static function abilityBlackBear(int $player_id, int $location_id, array $resources) {
        $message = clienttranslate('${player_name} get ${resources_to} from ${card_name}');
        self::notifyAll('onGetResourcesFromLocation', $message, [
            'player_id' => $player_id,
            'player_name' => self::getPlayerName($player_id),
            'location_id' => $location_id,
            'resources' => $resources,
            'resources_to' => $resources,
            'card_name' => clienttranslate("Black Bear"),
            'i18n' => ['card_name']
        ]);
    }

    /*************************
     **** GENERIC METHODS ****
     *************************/

    protected static function notifyAll($name, $msg, $args = [], $exclude_player_id = null) {
        if ($exclude_player_id != null) {
            $args['excluded_player_id'] = $exclude_player_id;
        }
        Game::get()->notifyAllPlayers($name, $msg, $args);
    }

    protected static function notify($player_id, $name, $msg, $args = []) {
        Game::get()->notifyPlayer($player_id, $name, $msg, $args);
    }

    protected static function message($msg, $args = [], $exclude_player_id = null) {
        self::notifyAll('message', $msg, $args);
    }

    protected static function messageTo($player_id, $msg, $args = []) {
        self::notify($player_id, 'message', $msg, $args);
    }

    protected static function getPlayerName(int $player_id) {
        return Game::get()->getPlayerNameById($player_id);
    }

    /////////////////////////////////
    /////// Private Methods
    private static function getConfortCardArgs($card, $player_id) {
        if (!array_key_exists('type_arg', $card)) {
            throw new BgaSystemException("Invalid card");
        }

        return [
            'player_id' => $player_id,
            'player_name' => self::getPlayerName($player_id),
            'card_name' => Conforts::getName($card),
            'card' => $card,
            "i18n" => ["card_name"],
        ];
    }
    private static function getConfortCardOtherArgs($card, $player_id) {
        return [
            'player_id' => $player_id,
            'player_name' => self::getPlayerName($player_id),
            'card' => ['id' => $card['id']],
        ];
    }
}
