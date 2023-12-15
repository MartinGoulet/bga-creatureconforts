<?php

namespace CreatureComforts\Managers;

use CreatureComforts\Core\Game;
use CreatureComforts\Core\Notifications;

const LADDER = 'slot';
const GLADE = 'glade';


/*
 * Cards manager : allows to easily access card
 */
class Improvements extends \APP_DbObject {

    static function anonymize($cards, bool $anonymize = true) {
        if (!$anonymize) return $cards;

        return array_map(function ($card) {
            return ['id' => $card['id']];
        }, $cards);
    }

    static function getCardInLocation() {
        
    }

    static function getDeck() {
        $cards = self::deck()->getCardsInLocation('deck', null, 'location_arg');
        return self::anonymize($cards);
    }

    static function setupNewGame(array $players) {
        $is_solo = count($players) == 1;
        $cards = [];
        foreach (Game::get()->improvement_types as $id => $improvement) {
            if ($is_solo && $improvement['solo'] == true || !$is_solo) {
                $cards[] = ['type' => $id, 'type_arg' => 1, 'nbr' => $is_solo ? 1 : 2];
            }
        }
        self::deck()->createCards($cards);
        self::deck()->shuffle('deck');

        for ($i = 1; $i <= 6; $i++) {
            self::deck()->pickCardForLocation('deck', LADDER, $i);
        }
    }

    static function getUIData() {
        $result = [
            'discard' => array_values(self::deck()->getCardsInLocation('discard', null, 'location_arg')),
            'deckCount' => self::deck()->countCardInLocation('deck'),
            'market' => array_values(self::deck()->getCardsInLocation(LADDER, null, 'location_arg')),
            'glade' => array_values(self::getGlade()),
            'players' => [],
        ];

        $players = Game::get()->loadPlayersBasicInfos();
        foreach ($players as $player_id => $player) {
            $result['players'][$player_id] = self::getPlayerBoard($player_id);
        }

        return $result;
    }

    static function addToGlade($card, int $player_id) {
        $cards = self::getGlade();
        $position = 20 + sizeof($cards);
        $id = $card['id'];
        self::deck()->moveCard($card['id'], 'glade', $position);
    }

    static function addToPlayerBoard($card, int $player_id) {
        self::deck()->moveCard($card['id'], 'board', $player_id);
    }

    static function discardBottomLadder() {
        $deck = self::deck();

        $cards = $deck->getCardsInLocation(LADDER, 1);
        $bottomCard = array_shift($cards);
        $deck->playCard($bottomCard['id']);

        return $deck->getCard($bottomCard['id']);
    }

    static function get(int $card_id) {
        return self::deck()->getCard($card_id);
    }

    static function getCardType($card) {
        return Game::get()->improvement_types[$card['type']];
    }

    static function getName($card) {
        $card_type = Game::get()->improvement_types[$card['type']];
        return $card_type['name'];
    }

    static function getGlade() {
        return self::deck()->getCardsInLocation('glade', null, 'card_location');
    }

    static function getLadder() {
        return array_values(self::deck()->getCardsInLocation(LADDER, null, 'location_arg'));
    }

    static function getFromLadder($position) {
        $cards = self::deck()->getCardsInLocation(LADDER, $position);
        return array_shift($cards);
    }

    static function getPlayerBoard($player_id) {
        $cards = self::deck()->getCardsInLocation('board', $player_id);
        return array_values($cards);
    }

    static function hasBicycle($player_id) {
        $cards = self::deck()->getCardsOfTypeInLocation('4', null, 'board', $player_id);
        return sizeof($cards) > 0;
    }

    static function hasToolShed($player_id) {
        $cards = self::deck()->getCardsOfTypeInLocation('6', null, 'board', $player_id);
        return sizeof($cards) > 0;
    }

    static function hasUmbrella($player_id) {
        $cards = self::deck()->getCardsOfTypeInLocation('9', null, 'board', $player_id);
        return sizeof($cards) > 0;
    }

    static function hasScale($player_id) {
        $cards = self::deck()->getCardsOfTypeInLocation('15', null, 'board', $player_id);
        return sizeof($cards) > 0;
    }

    static function refillLadder() {
        $deck = self::deck();
        for ($i = 1; $i < 6; $i++) {
            $cards = $deck->getCardsInLocation(LADDER, $i);
            if (sizeof($cards) == 0) {
                for ($j = $i + 1; $j < 6; $j++) {
                    $slot = $deck->getCardsInLocation(LADDER, $j);
                    $next_card = array_shift($slot);
                    $deck->moveCard($next_card['id'], LADDER, $j - 1);
                }
            }
        }

        $shuffle = $deck->countCardInLocation('deck') == 0;
        if($shuffle) {
            $deck->moveAllCardsInLocation('discard', 'deck');
            $deck->shuffle('deck');
        }

        $slot = $deck->getCardsInLocation(LADDER, 6);
        if (sizeof($slot) == 1) {
            $next_card = array_shift($slot);
            $deck->moveCard($next_card['id'], LADDER, 5);
        }
        $deck->pickCardForLocation('deck', LADDER, 6);

        return $shuffle;
    }

    private static function deck() {
        return Game::get()->improvements;
    }
}
