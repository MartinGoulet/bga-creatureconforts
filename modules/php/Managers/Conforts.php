<?php

namespace CreatureConforts\Managers;

use CreatureConforts\Core\Game;

/*
 * Cards manager : allows to easily access card
 */

class Conforts {

    static function anonymize($cards, bool $anonymize = true) {
        if (!$anonymize) return $cards;

        return array_map(function ($card) {
            return ['id' => $card['id']];
        }, $cards);
    }

    static function addCardToDiscard(int $card_id) {
        self::deck()->playCard($card_id);
    }

    static function addToHand(array $card, int $player_id) {
        self::deck()->moveCard($card['id'], 'hand', $player_id);
        return self::deck()->getCard($card['id']);
    }

    static function cancelStartHand($player_id) {
        self::deck()->moveAllCardsInLocation('selection', 'hand', $player_id, $player_id);
    }

    static function discardStartHand() {
        $cards = array_values(self::deck()->getCardsInLocation('selection'));
        $card_ids = array_column($cards, 'id');
        foreach ($card_ids as $card_id) {
            self::deck()->insertCardOnExtremePosition($card_id, 'discard', true);
        }
        return $cards;
    }

    static function draw($player_id, $count = 1) {
        // Each player starts with 3 cards in hand
        if ($count == 1) {
            return self::deck()->pickCard('deck', $player_id);
        } else {
            return self::deck()->pickCards($count, 'deck', $player_id);
        }
    }

    static function get($card_id) {
        return self::deck()->getCard($card_id);
    }

    static function getCards(array $card_ids) {
        return self::deck()->getCards($card_ids);
    }

    static function getFromMarket($slot_id) {
        $cards = self::deck()->getCardsInLocation('slot', $slot_id);
        return array_shift($cards);
    }

    static function getUIData(int $current_player_id) {

        $result = [
            'discard' => array_values(self::deck()->getCardsInLocation('discard', null, 'location_arg')),
            'deckCount' => self::deck()->countCardInLocation('deck'),
            'market' => array_values(self::deck()->getCardsInLocation('slot', null, 'location_arg')),
            'players' => [],
        ];

        $players = Game::get()->loadPlayersBasicInfos();
        foreach ($players as $player_id => $player) {
            $result['players'][$player_id] = [
                'board' => self::getPlayerBoard($player_id),
                'hand' => self::anonymize(self::getHand($player_id), $player_id != $current_player_id),
            ];
        }

        return $result;
    }

    static function discardLeftMostOwlNest() {
        $deck = self::deck();

        $cards = $deck->getCardsInLocation('slot', 1);
        $leftMostCard = array_shift($cards);
        $deck->playCard($leftMostCard['id']);

        return $deck->getCard($leftMostCard['id']);
    }

    static function getDeck() {
        $cards = self::deck()->getCardsInLocation('deck', null, 'location_arg');
        return self::anonymize($cards);
    }
    static function getDiscard() {
        $cards = self::deck()->getCardsInLocation('discard', null, 'location_arg');
        return array_values($cards);
    }

    static function getHand($player_id) {
        $cards = self::deck()->getPlayerHand($player_id);
        $selection = self::deck()->getCardsInLocation('selection', $player_id);
        return array_values(array_merge($cards, $selection));
    }

    static function getName($card) {
        $card_type = Game::get()->confort_types[$card['type']];
        return $card_type['name'];
    }

    static function getCost($card) {
        $card_type = Game::get()->confort_types[$card['type']];
        return $card_type['cost'];
    }

    static function getOwlNest() {
        return array_values(self::deck()->getCardsInLocation('slot', null, 'location_arg'));
    }

    static function getPlayerBoard($player_id) {
        $cards = self::deck()->getCardsInLocation('board', $player_id);
        return array_values($cards);
    }

    static function moveCardToPlayerBoard($player_id, $card_id) {
        self::deck()->movecard($card_id, 'board', $player_id);
    }

    static function refillOwlNest() {
        $deck = self::deck();
        for ($i = 1; $i < 4; $i++) {
            $cards = $deck->getCardsInLocation('slot', $i);
            if (sizeof($cards) == 0) {
                for ($j = $i + 1; $j < 4; $j++) {
                    $slot = $deck->getCardsInLocation('slot', $j);
                    $next_card = array_shift($slot);
                    $deck->moveCard($next_card['id'], 'slot', $j - 1);
                }
            }
        }

        $slot = $deck->getCardsInLocation('slot', 4);
        if (sizeof($slot) == 1) {
            $next_card = array_shift($slot);
            $deck->moveCard($next_card['id'], 'slot', 3);
        }
        $deck->pickCardForLocation('deck', 'slot', 4);
    }

    static function remainderStartHand(int $card_id, int $player_id) {
        self::deck()->moveCard($card_id, 'selection', $player_id);
    }

    static function setupNewGame($players, $options) {
        $cards = [];
        foreach (Game::get()->confort_types as $id => $card_type) {
            $cards[] = ['type' => $id, 'type_arg' => 1, 'nbr' => 1];
            $cards[] = ['type' => $id, 'type_arg' => 2, 'nbr' => 1];
            $cards[] = ['type' => $id, 'type_arg' => 3, 'nbr' => 1];
        }
        self::deck()->createCards($cards);
        self::deck()->shuffle('deck');

        // 4 cards for the market
        for ($i = 1; $i <= 4; $i++) {
            self::deck()->pickCardForLocation('deck', 'slot', $i);
        }

        // Each player starts with 3 cards in hand
        foreach ($players as $player_id => $player) {
            self::deck()->pickCards(3, 'deck', $player_id);
        }
    }

    /**
     * @return \Deck
     */
    private static function deck() {
        return Game::get()->conforts;
    }
}
