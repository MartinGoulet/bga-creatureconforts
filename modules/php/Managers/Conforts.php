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

    static function get($card_id) {
        return self::deck()->getCard($card_id);
    }

    static function getUIData() {
        return [
            'discard' => [
                'topCard' => self::deck()->getCardOnTop('discard'),
                'count' => self::deck()->countCardInLocation('discard'),
            ],
            'deckCount' => self::deck()->countCardInLocation('deck'),
            'market' => array_values(self::deck()->getCardsInLocation('slot', null, 'location_arg')),
        ];
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
