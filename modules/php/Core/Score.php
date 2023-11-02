<?php

namespace CreatureConforts\Core;

use CreatureConforts\Managers\Conforts;
use CreatureConforts\Managers\Cottages;
use CreatureConforts\Managers\Improvements;
use CreatureConforts\Managers\Players;

/*
 * Score: a wrapper over table object to allow more generic modules
 */

class Score extends \APP_DbObject {

    public static function getScore(int $player_id) {
        $improvements = Improvements::getPlayerBoard($player_id);
        $comforts = Conforts::getPlayerBoard($player_id);

        return [
            "comforts" => self::getScoreComforts($comforts),
            "comforts_bonus" => self::getScoreComfortsBonus($comforts, $player_id),
            "improvements" => self::getScoreImprovements($improvements),
            "improvements_bonus" => self::getScoreImprovementsBonus($improvements, $player_id),
            "cottages" => self::getScoreCottage($player_id),
            "resources" => self::getScoreResources($player_id),
        ];
    }

    private static function getScoreComforts($comforts) {
        $score = 0;
        foreach ($comforts as $comfort) {
            $type = Conforts::getCardType($comfort);
            $score += intval($type['score']);
        }
        return $score;
    }

    private static function getScoreComfortsBonus($comforts, int $player_id) {
        $score = 0;
        foreach ($comforts as $comfort) {
            $card_info = Conforts::getCardType($comfort);
            if (array_key_exists('class', $card_info)) {
                $instance = new $card_info['class']();
                $score += $instance->getScore($player_id, intval($comfort['id']));
            }
            // Recipe Book / Pattern Book Improvements
            if ($card_info['type'] == FOOD || $card_info['type'] == CLOTHING) {
                $resources = Globals::getComfortResource($comfort['id']);
                if (array_key_exists(STORY, $resources)) {
                    $score += 4;
                }
            }
        }
        return $score;
    }

    private static function getScoreImprovements($improvements) {
        $score = 0;
        foreach ($improvements as $improvement) {
            $type = Improvements::getCardType($improvement);
            $score += intval($type['score']);
        }
        return $score;
    }

    private static function getScoreImprovementsBonus($improvements, int $player_id) {
        $score = 0;
        foreach ($improvements as $improvement) {
            switch (intval($improvement['type'])) {
                case 1: // Barrel Sauna
                    $score += self::getOtherPlayersComfortType($player_id, OUTDOOR) * 2;
                    break;
                case 2: // Writing Desk
                    $score += self::getOtherPlayersComfortType($player_id, OUTDOOR) * 2;
                    break;
                case 3: // Spinning Wheel
                    $score += self::getOtherPlayersComfortType($player_id, CLOTHING);
                    break;
                case 17: // Herb Garden
                    $score += self::getOtherPlayersComfortType($player_id, FOOD);
                    break;
            }
        }
        return $score;
    }

    private static function getOtherPlayersComfortType(int $current_player_id, string $type) {
        $count = 0;
        $players = Game::get()->loadPlayersBasicInfos();
        foreach ($players as $player_id => $player) {
            if ($player_id !== $current_player_id) {
                $cards = Conforts::getPlayerBoard($player_id);
                foreach ($cards as $card) {
                    if (Conforts::getCardType($card) === $type) {
                        $count += 1;
                    }
                }
            }
        }
        return $count;
    }

    private static function getScoreCottage($player_id) {
        $nbrCottage = intval(Cottages::countPlayerCottageRemaining($player_id));
        $scores = [0 => 8, 1 => 7, 2 => 3, 3 => 1, 4 => 0];
        return $scores[$nbrCottage];
    }

    private static function getScoreResources($player_id) {
        $resources = Players::getResources($player_id);
        $goods = $resources['wood'] + $resources['stone'] + $resources['fruit'] + $resources['mushroom'] + $resources['yarn'] + $resources['grain'];
        $scores = [
            "story" => intval($resources["story"]) * 2,
            "coin" => intval($resources["coin"]),
            "resources" => intdiv($goods, 3),
        ];
        return array_sum($scores);
    }
}
