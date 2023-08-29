<?php

namespace CreatureConforts\Managers;

use CreatureConforts\Core\Game;

/*
 * Cards manager : allows to easily access card
 */

class Travelers {

    static function anonymize($cards, bool $anonymize = true) {
        if (!$anonymize) return $cards;

        return array_map(function ($card) {
            return ['id' => $card['id']];
        }, $cards);
    }

    static function setupNewGame() {
        $cards = [];
        foreach (Game::get()->traveler_types as $id => $card_type) {
            $cards[] = ['type' => $id, 'type_arg' => 1, 'nbr' => 1];
        }
        self::deck()->createCards($cards);
        self::deck()->shuffle('deck');
    }

    static function count() {
        return self::deck()->countCardInLocation('deck');
    }

    static function discardTopCard() {
        self::deck()->pickCardForLocation('deck', 'discard');
    }

    static function getName($card) {
        $card_type = Game::get()->traveler_types[$card['type']];
        return $card_type['name'];
    }

    static function getUIData() {
        $cards = self::deck()->getCardsInLocation('revealed');
        return [
            'topCard' => array_shift($cards),
            'count' => self::deck()->countCardInLocation('deck') + self::deck()->countCardInLocation('revealed'),
        ];
    }

    static function getTopCard() {
        return self::getUIData();
    }

    static function revealTopCard() {
        self::deck()->pickCardForLocation('deck', 'revealed');
    }

    private static function deck() {
        return Game::get()->travelers;
    }
}
