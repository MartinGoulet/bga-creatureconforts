<?php

namespace CreatureComforts\Cards\Travelers;

use BgaUserException;
use CreatureComforts\Core\Notifications;
use CreatureComforts\Helpers\ResourcesHelper;
use CreatureComforts\Managers\Comforts;
use CreatureComforts\Managers\Players;

class StripedSkunk {
    static function resolve(int $die_value, array $resources, array $group, array $resources2, array $group2, array $card_ids) {
        if ($die_value <= 1) {
            self::resolve_first($resources, $group);
        } else if ($die_value <= 5) {
            self::resolve_second($resources2, $group2, $card_ids);
        } else {
            self::resolve_third($card_ids);
        }
    }
    static function resolve_first(array $resources, array $group) {
        Players::addResources(Players::getPlayerId(), [STORY => 1]);
        Notifications::travelerReceivedResources([STORY => 1]);
    }
    static function resolve_second(array $resources2, array $group2, array $card_ids) {
        if (sizeof($card_ids) > 2) {
            throw new BgaUserException('Too many resources');
        }
        if (sizeof($resources2) != sizeof($card_ids) * 2) {
            throw new BgaUserException("Wrong number of resource to get");
        }
        if (!ResourcesHelper::isGroupLimitedTo($group2, GOODS)) {
            throw new BgaUserException("Wrong type of resource");
        }
        $player_id = Players::getPlayerId();
        $hand = Comforts::getHand($player_id);
        $cards = [];
        foreach ($card_ids as $card_id) {
            $filter = array_filter($hand, function ($card) use ($card_id) {
                return $card['id'] == $card_id;
            });
            if (sizeof($filter) == 0) {
                throw new BgaUserException("Card not in your hand " . $card_id);
            }
            Comforts::addCardToDiscard($card_id);
            $cards[] = array_shift($filter);
        }
        Notifications::discardConfort($cards);
        Players::addResources($player_id, $group2);
        Notifications::travelerExchangeResources([CARD => sizeof($card_ids)], $group2);
    }
    static function resolve_third(array $card_ids) {
        if (sizeof($card_ids) !== 2) {
            throw new BgaUserException('Not enough cards');
        }

        $player_id = Players::getPlayerId();
        $hand = Comforts::getHand($player_id);
        $cards = [];
        foreach ($card_ids as $card_id) {
            $filter = array_filter($hand, function ($card) use ($card_id) {
                return $card['id'] == $card_id;
            });
            if (sizeof($filter) == 0) {
                throw new BgaUserException("Card not in your hand " . $card_id);
            }
            Comforts::addCardToDiscard($card_id);
            $cards[] = array_shift($filter);
        }
        Notifications::discardConfort($cards);
        Players::addResources($player_id, [COIN => 1, STORY => 1]);
        Notifications::travelerExchangeResources([CARD => sizeof($card_ids)], [COIN => 1, STORY => 1]);
    }
}
