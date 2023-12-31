<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * CreatureComforts implementation : © Martin Goulet <martin.goulet@live.ca>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * creatureconforts.action.php
 *
 * CreatureComforts main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/creatureconforts/creatureconforts/myAction.html", ...)
 *
 */


class action_creatureconforts extends APP_GameAction {
   // Constructor: please do not modify
   public function __default() {
      if (self::isArg('notifwindow')) {
         $this->view = "common_notifwindow";
         $this->viewArgs['table'] = self::getArg("table", AT_posint, true);
      } else {
         $this->view = "creatureconforts_creatureconforts";
         self::trace("Complete reinitialization of board game");
      }
   }

   public function cancelStartHand() {
      self::setAjaxMode();
      // Then, call the appropriate method in your game logic
      $this->game->gamestate->checkPossibleAction('cancelStartHand');
      $this->game->cancelStartHand();
      self::ajaxResponse();
   }

   public function discardStartHand() {
      self::setAjaxMode();
      // Retrieve arguments
      $card_id = self::getArg("card_id", AT_posint, true);
      // Then, call the appropriate method in your game logic
      $this->game->checkAction('discardStartHand');
      $this->game->discardStartHand($card_id);
      self::ajaxResponse();
   }

   // TODO: defines your action entry points there

   public function confirmPlacement() {
      self::setAjaxMode();
      // Retrieve arguments
      $locations = self::getArg("locations", AT_numberlist, true);
      $wheelbarrow = self::getArg("wheelbarrow", AT_int, true);
      $locations_id = self::getArrayArgs($locations);
      // Then, call the appropriate method in your game logic
      $this->game->checkAction('confirmPlacement');
      $this->game->confirmPlacement($locations_id, $wheelbarrow);
      self::ajaxResponse();
   }

   public function cancelPlacement() {
      self::setAjaxMode();
      // Then, call the appropriate method in your game logic
      $this->game->gamestate->checkPossibleAction('cancelPlacement');
      $this->game->cancelPlacement();
      self::ajaxResponse();
   }

   public function confirmPlayerDice() {
      self::setAjaxMode();
      // Retrieve arguments
      $dice_ids = self::getArg("dice_ids", AT_numberlist, true);
      $location_ids = self::getArg("location_ids", AT_numberlist, true);
      $lesson = self::getArg("lesson", AT_numberlist, true);
      $umbrella = self::getArg("umbrella", AT_numberlist, true);

      $dice_ids = self::getArrayArgs($dice_ids);
      $location_ids = self::getArrayArgs($location_ids);
      $lesson = self::getArrayArgs($lesson);
      $umbrella = self::getArrayArgs($umbrella);

      // Then, call the appropriate method in your game logic
      $this->game->checkAction('confirmPlayerDice');
      $this->game->confirmPlayerDice($dice_ids, $location_ids, $lesson, $umbrella);
      self::ajaxResponse();
   }

   public function resolveWorker() {
      self::setAjaxMode();
      // Retrieve arguments
      $location_id = self::getArg("location_id", AT_posint, true);
      $resources = self::getArg("resources", AT_numberlist, false, '');
      $resources2 = self::getArg("resources2", AT_numberlist, false, '');
      $card_ids = self::getArg("card_ids", AT_numberlist, false, '');
      $option = self::getArg("option", AT_int, false, 0);
      $resources = self::getArrayArgs($resources);
      $resources2 = self::getArrayArgs($resources2);
      $card_ids = self::getArrayArgs($card_ids);
      // Then, call the appropriate method in your game logic
      $this->game->checkAction('resolveWorker');
      $this->game->resolveWorker($location_id, $resources, $resources2, $card_ids, $option);
      self::ajaxResponse();
   }

   public function confirmResolveWorker() {
      self::setAjaxMode();
      // Retrieve arguments
      // Then, call the appropriate method in your game logic
      $this->game->checkAction('confirmResolveWorker');
      $this->game->confirmResolveWorker();
      self::ajaxResponse();
   }

   public function undo() {
      self::setAjaxMode();
      // Retrieve arguments
      // Then, call the appropriate method in your game logic
      $this->game->checkAction('undo');
      $this->game->undo();
      self::ajaxResponse();
   }

   public function craftConfort() {
      self::setAjaxMode();
      // Retrieve arguments
      $card_id = self::getArg("card_id", AT_posint, true);
      $resources = self::getArg("resources", AT_numberlist, true);
      $resources = self::getArrayArgs($resources);
      // Then, call the appropriate method in your game logic
      $this->game->checkAction('craftConfort');
      $this->game->craftConfort($card_id, $resources);
      self::ajaxResponse();
   }

   public function passCraftConfort() {
      self::setAjaxMode();
      // Retrieve arguments
      // Then, call the appropriate method in your game logic
      $this->game->checkAction('passCraftConfort');
      $this->game->passCraftConfort();
      self::ajaxResponse();
   }

   public function pass() {
      self::setAjaxMode();
      // Retrieve arguments
      // Then, call the appropriate method in your game logic
      $notification = self::getArg("notification", AT_bool, true);
      $this->game->checkAction('pass');
      $this->game->pass($notification);
      self::ajaxResponse();
   }

   public function discardConfort() {
      self::setAjaxMode();
      // Retrieve arguments
      $card_ids = self::getArg("card_ids", AT_numberlist, true);
      $card_ids = self::getArrayArgs($card_ids);
      // Then, call the appropriate method in your game logic
      $this->game->checkAction('discardConfort');
      $this->game->discardConfort($card_ids);
      self::ajaxResponse();
   }

   public function confirmStoreResource() {
      self::setAjaxMode();
      // Retrieve arguments
      $info_raw = self::getArg("info", AT_numberlist, true);
      $info = self::getArrayOfArrayArgs($info_raw);
      // Then, call the appropriate method in your game logic
      $this->game->gamestate->checkPossibleAction('confirmStoreResource');
      $this->game->confirmStoreResource($info);
      self::ajaxResponse();
   }

   public function confirmGrayWolf() {
      self::setAjaxMode();
      // Retrieve arguments
      $slot_id = intval(self::getArg("slot_id", AT_int));
      // Then, call the appropriate method in your game logic
      $this->game->checkAction('confirmGrayWolf');
      $this->game->confirmGrayWolf($slot_id);
      self::ajaxResponse();
   }

   public function confirmCanadaLynx() {
      self::setAjaxMode();
      // Retrieve arguments
      $resources = self::getArg("resources", AT_numberlist, true);
      $resources = self::getArrayArgs($resources);
      // Then, call the appropriate method in your game logic
      $this->game->checkAction('confirmCanadaLynx');
      $this->game->confirmCanadaLynx($resources);
      self::ajaxResponse();
   }

   public function confirmCommonRaven() {
      self::setAjaxMode();
      // Retrieve arguments
      $location_id = intval(self::getArg("location_id", AT_int));
      // Then, call the appropriate method in your game logic
      $this->game->checkAction('confirmCommonRaven');
      $this->game->confirmCommonRaven($location_id);
      self::ajaxResponse();
   }

   public function confirmMoose() {
      self::setAjaxMode();
      // Retrieve arguments
      $resource = intval(self::getArg("resource", AT_int));
      // Then, call the appropriate method in your game logic
      $this->game->checkAction('confirmMoose');
      $this->game->confirmMoose($resource);
      self::ajaxResponse();
   }

   public function confirmStripedSkunk() {
      self::setAjaxMode();
      // Retrieve arguments
      $card_id = intval(self::getArg("card_id", AT_int));
      // Then, call the appropriate method in your game logic
      $this->game->checkAction('confirmStripedSkunk');
      $this->game->confirmStripedSkunk($card_id);
      self::ajaxResponse();
   }

   public function confirmWildTurkey() {
      self::setAjaxMode();
      // Retrieve arguments
      $die_id = self::getArg("die_id", AT_int, true);
      $die_value = self::getArg("die_value", AT_int, true);
      // Then, call the appropriate method in your game logic
      $this->game->gamestate->checkPossibleAction('confirmWildTurkey');
      $this->game->confirmWildTurkey($die_id, $die_value);
      self::ajaxResponse();
   }

   public function cancelWildTurkey() {
      self::setAjaxMode();
      $this->game->gamestate->checkPossibleAction('cancelWildTurkey');
      $this->game->cancelWildTurkey();
      self::ajaxResponse();
   }

   public function confirmBicycle() {
      self::setAjaxMode();
      // Retrieve arguments
      $location_from = intval(self::getArg("location_from", AT_int));
      $location_to = intval(self::getArg("location_to", AT_int));
      // Then, call the appropriate method in your game logic
      $this->game->checkAction('confirmBicycle');
      $this->game->confirmBicycle($location_from, $location_to);
      self::ajaxResponse();
   }

   /*
    
    Example:
  	
    public function myAction()
    {
        self::setAjaxMode();     

        // Retrieve arguments
        // Note: these arguments correspond to what has been sent through the javascript "ajaxcall" method
        $arg1 = self::getArg( "myArgument1", AT_posint, true );
        $arg2 = self::getArg( "myArgument2", AT_posint, true );

        // Then, call the appropriate method in your game logic
        $this->game->myAction( $arg1, $arg2 );

        self::ajaxResponse( );
    }
    
    */

    private function getArrayOfArrayArgs($args) {
      // Removing last ';' if exists
      if (substr($args, -1) == ';')
         $args = substr($args, 0, -1);

      if ($args == '')
         $args = array();
      else
         $args = explode('|', $args);

      $new_array = [];
      foreach($args as $arg) {
         $new_array[] = self::getArrayArgs($arg);
      }

      return $new_array;
   }

   private function getArrayArgs($args) {
      // Removing last ';' if exists
      if (substr($args, -1) == ';')
         $args = substr($args, 0, -1);

      if ($args == '')
         $args = array();
      else
         $args = explode(';', $args);

      return $args;
   }
}
