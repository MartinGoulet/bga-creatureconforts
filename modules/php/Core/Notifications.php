<?php

namespace CreatureConforts\Core;

use CreatureConforts\Managers\Conforts;
use CreatureConforts\Managers\Travelers;

class Notifications extends \APP_DbObject {

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

    static function familyDice($dice) {
        self::notifyAll('onFamilyDice', '', [
            'dice' => $dice,
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

}
