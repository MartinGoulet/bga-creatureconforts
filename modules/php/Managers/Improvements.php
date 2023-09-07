<?php

namespace CreatureConforts\Managers;

use CreatureConforts\Core\Game;

const LADDER = 'slot';

/*
 * Cards manager : allows to easily access card
 */
class Improvements {

    static function setupNewGame() {
        $cards = [];
        foreach (range(1, 17) as $id) {
            $cards[] = ['type' => $id, 'type_arg' => 1, 'nbr' => 1];
            $cards[] = ['type' => $id, 'type_arg' => 2, 'nbr' => 1];
        }
        self::deck()->createCards($cards);
        self::deck()->shuffle('deck');

        for ($i = 1; $i <= 6; $i++) {
            self::deck()->pickCardForLocation('deck', LADDER, $i);
        }
    }

    static function getUIData() {
        return [
            'discard' => [
                'topCard' => self::deck()->getCardOnTop('discard'),
                'count' => self::deck()->countCardInLocation('discard'),
            ],
            'deckCount' => self::deck()->countCardInLocation('deck'),
            'market' => array_values(self::deck()->getCardsInLocation(LADDER, null, 'location_arg')),
        ];
    }

    static function discardBottomLadder() {
        $deck = self::deck();

        $cards = $deck->getCardsInLocation(LADDER, 1);
        $bottomCard = array_shift($cards);
        $deck->playCard($bottomCard['id']);

        return $deck->getCard($bottomCard['id']);
    }

    static function getLadder() {
        return array_values(self::deck()->getCardsInLocation('slot', null, 'location_arg'));
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

        $slot = $deck->getCardsInLocation('slot', 6);
        $next_card = array_shift($slot);
        $deck->moveCard($next_card['id'], LADDER, 5);
        $deck->pickCardForLocation('deck', LADDER, 6);
    }

    private static function deck() {
        return Game::get()->improvements;
    }

}
