<?php

namespace CreatureConforts\Managers;

use CreatureConforts\Core\Game;

/*
 * Cards manager : allows to easily access card
 */

class Valleys {

    static function setupNewGame($options = []) {
        $forest = [];
        $meadow = [];
        foreach (Game::get()->valley_types as $id => $card_type) {
            if ($id < 10) {
                $forest[] = ['type' => $card_type['season'], 'type_arg' => $id, 'nbr' => 1];
            } else {
                $meadow[] = ['type' => $card_type['season'], 'type_arg' => $id, 'nbr' => 1];
            }
        }

        self::deck()->createCards($forest, FOREST . "temp");
        self::deck()->createCards($meadow, MEADOW . "temp");

        $isShortGame = ($options[OPTION_SHORT_GAME] ?? 1) == OPTION_SHORT_GAME_ENABLED;

        foreach ([FOREST, MEADOW] as $region) {
            foreach ([FALL, SUMMER, SPRING] as $season) {
                $cards = self::deck()->getCardsOfTypeInLocation($season, null, $region . "temp");
                $cards_id = array_map(function ($card) {
                    return $card['id'];
                }, $cards);
                shuffle($cards_id);
                $cards_id = array_slice($cards_id, 0, $isShortGame || $region == FALL ? 2 : 3);
                foreach ($cards_id as $card_id) {
                    self::deck()->insertCardOnExtremePosition($card_id, $region, true);
                }
            }
        }
    }

    static function getUIData() {
        return [
            FOREST => [
                'topCard' => self::deck()->getCardOnTop(FOREST),
                'count' => self::deck()->countCardInLocation(FOREST),
            ],
            MEADOW => [
                'topCard' => self::deck()->getCardOnTop(MEADOW),
                'count' => self::deck()->countCardInLocation(MEADOW),
            ],
        ];
    }

    // static function getUIDataForest() {
    //     return [self::deck()->getCardOnTop(FOREST)];
    //     // $cards = self::deck()->getCardsInLocation(FOREST, null, 'location_arg');
    //     // return array_values($cards);
    // }

    // static function getUIDataMeadow() {
    //     return [self::deck()->getCardOnTop(MEADOW)];
    //     // $cards = self::deck()->getCardsInLocation(MEADOW, null, 'location_arg');
    //     // return array_values($cards);
    // }

    private static function deck() {
        return Game::get()->valleys;
    }
}
