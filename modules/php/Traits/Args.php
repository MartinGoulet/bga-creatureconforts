<?php

namespace CreatureConforts\Traits;

use CreatureConforts\Core\Game;
use CreatureConforts\Managers\Conforts;

trait Args {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Game state arguments
    ////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    public function argStartHandDiscard() {
        $players = Game::get()->loadPlayersBasicInfos();
        $args = ["_private" => []];

        foreach ($players as $player_id => $player) {
            $cards = Conforts::getHand($player_id);
            $selection = array_values(array_filter($cards, function ($card) {
                return $card['location'] == 'selection';
            }));
            if (sizeof($selection) == 1) {
                $args["_private"][$player_id] = [
                    "card_id" => intval($selection[0]['id']),
                ];
            }
        }

        return $args;
    }
}
