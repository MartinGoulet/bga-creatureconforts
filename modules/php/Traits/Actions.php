<?php

namespace CreatureConforts\Traits;

use BgaUserException;
use CreatureConforts\Core\Game;
use CreatureConforts\Core\Globals;
use CreatureConforts\Managers\Conforts;
use CreatureConforts\Managers\Dice;
use CreatureConforts\Managers\Travelers;

trait Actions {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    ////////////

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in CreatureConforts.action.php)
    */

    function discardStartHand(int $card_id) {
        $current_player_id = $this->getCurrentPlayerId();
        $card = Conforts::get($card_id);

        if ($card['location'] !== 'hand' || $card['location_arg'] !== $current_player_id) {
            throw new \BgaUserException("You don't own the card");
        }

        // All checks are ok, now proceed
        Conforts::remainderStartHand($card_id, $current_player_id);

        // Desactivate the current player
        $this->gamestate->setPlayerNonMultiactive($current_player_id, '');
    }

    function cancelStartHand() {
        $current_player_id = $this->getCurrentPlayerId();
        $this->gamestate->setPlayersMultiactive([$current_player_id], '');
        Conforts::cancelStartHand($current_player_id);
    }

    function confirmPlacement(array $locations) {
        // Basic location
        $available_locations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        // TODO add location from cards

        foreach ($locations as $location) {
            if (!in_array($location, $available_locations)) {
                throw new BgaUserException(self::_("You are not allowed to go one of the location you choose (" . $location . "}"));
            }
        }

        $current_player_id = $this->getCurrentPlayerId();
        Globals::setWorkerPlacement($current_player_id, $locations);
        $this->gamestate->setPlayerNonMultiactive($current_player_id, '');
    }

    function cancelPlacement() {
        $current_player_id = $this->getCurrentPlayerId();
        $this->gamestate->setPlayersMultiactive([$current_player_id], '');
        Globals::setWorkerPlacement($current_player_id, []);
    }
}
