<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * CreatureConforts implementation : © Martin Goulet <martin.goulet@live.ca>
 * 
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * material.inc.php
 *
 * CreatureConforts game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */


$this->confort_types = [
   // --- gen php begin ---
   1 => [
      'name' => clienttranslate("Board Game"),
      'score' => 7,
   ],
   2 => [
      'name' => clienttranslate("Snowshoes"),
      'type' => OUTDOOR,
      'score' => 6,
   ],
   3 => [
      'name' => clienttranslate("Preserves"),
      'type' => FOOD,
      'score' => 4,
   ],
   4 => [
      'name' => clienttranslate("Ice Skates"),
      'type' => OUTDOOR,
      'score' => 6,
   ],
   5 => [
      'name' => clienttranslate("Muffler"),
      'type' => CLOTHING,
      'score' => 5,
   ],
   6 => [
      'name' => clienttranslate("Rocking Chair"),
      'score' => 5,
   ],
   7 => [
      'name' => clienttranslate("Piggy Bank"),
      'score' => 3,
   ],
   8 => [
      'name' => clienttranslate("Bookshelf"),
      'score' => 6,
   ],
   9 => [
      'name' => clienttranslate("Pot of Tea"),
      'score' => 4,
   ],
   10 => [
      'name' => clienttranslate("Candles"),
      'type' => LIGHTING,
      'score' => 5,
   ],
   11 => [
      'name' => clienttranslate("Socks"),
      'type' => CLOTHING,
      'score' => 4,
   ],
   12 => [
      'name' => clienttranslate("Pantry"),
      'score' => 5,
   ],
   13 => [
      'name' => clienttranslate("Pie"),
      'type' => FOOD,
      'score' => 4,
   ],
   14 => [
      'name' => clienttranslate("Stew"),
      'type' => FOOD,
      'score' => 5,
   ],
   15 => [
      'name' => clienttranslate("Flute"),
      'score' => 4,
   ],
   16 => [
      'name' => clienttranslate("Soup"),
      'type' => FOOD,
      'score' => 5,
   ],
   17 => [
      'name' => clienttranslate("Fairy Garden"),
      'score' => 4,
   ],
   18 => [
      'name' => clienttranslate("Toys"),
      'score' => 6,
   ],
   19 => [
      'name' => clienttranslate("Toboggan"),
      'type' => OUTDOOR,
      'score' => 5,
   ],
   20 => [
      'name' => clienttranslate("Mandolin"),
      'score' => 6,
   ],
   21 => [
      'name' => clienttranslate("Quilt"),
      'type' => CLOTHING,
      'score' => 7,
   ],
   22 => [
      'name' => clienttranslate("Bread"),
      'type' => FOOD,
      'score' => 4,
   ],
   23 => [
      'name' => clienttranslate("Hearth"),
      'type' => LIGHTING,
      'score' => 6,
   ],
   24 => [
      'name' => clienttranslate("Lamp"),
      'type' => LIGHTING,
      'score' => 4,
   ],
   // --- gen php end --- 
];

$this->improvement_types = [
   // --- gen php begin improvements ---
   1 => [
      'name' => clienttranslate("Barrel Sauna"),
      'score' => 2,
      'cost' => [WOOD => 1, STONE => 1],
      'power' => "Gain ::heart-2:: for every Outdoor Confort owned by all other players",
   ],
   2 => [
      'name' => clienttranslate("Writing Desk"),
      'score' => 2,
      'cost' => [WOOD => 1, STONE => 1],
   ],
   3 => [
      'name' => clienttranslate("Spinning Wheel"),
      'score' => 2,
      'cost' => [WOOD => 1, YARN => 1],
   ],
   4 => [
      'name' => clienttranslate("Bicycle"),
      'score' => 2,
      'cost' => [WOOD => 2, STONE => 1],
   ],
   5 => [
      'name' => clienttranslate("Pattern Book"),
      'score' => 3,
      'cost' => [YARN => 1, FRUIT => 1, STORY => 1],
   ],
   6 => [
      'name' => clienttranslate("Tool Shed"),
      'score' => 2,
      'cost' => [WOOD => 2],
   ],
   7 => [
      'name' => clienttranslate("Guest Cottage"),
      'score' => 4,
      'cost' => [WOOD => 1, STONE => 2, GRAIN => 1],
   ],
   8 => [
      'name' => clienttranslate("Orchard"),
      'score' => 2,
      'cost' => [WOOD => 2, STONE => 1],
   ],
   9 => [
      'name' => clienttranslate("Umbrella"),
      'score' => 3,
      'cost' => [COIN => 2],
   ],
   10 => [
      'name' => clienttranslate("Almanac"),
      'score' => 3,
      'cost' => [WOOD => 1, STONE => 1, COIN => 2],
   ],
   11 => [
      'name' => clienttranslate("Wheelbarrow"),
      'score' => 2,
      'cost' => [WOOD => 2, COIN => 1],
   ],
   12 => [
      'name' => clienttranslate("Recipe Book"),
      'score' => 3,
      'cost' => [GRAIN => 1, MUSHROOM => 1, STORY => 1],
   ],
   13 => [
      'name' => clienttranslate("Weathervane"),
      'score' => 3,
      'cost' => [STONE => 2, COIN => 1],
   ],
   14 => [
      'name' => clienttranslate("Wildwood"),
      'score' => 2,
      'cost' => [WOOD => 2, STONE => 1],
   ],
   15 => [
      'name' => clienttranslate("Scale"),
      'score' => 1,
      'cost' => [WOOD => 1, STONE => 2],
   ],
   16 => [
      'name' => clienttranslate("Field"),
      'score' => 2,
      'cost' => [WOOD => 1, STONE => 2],
   ],
   17 => [
      'name' => clienttranslate("Herb Garden"),
      'score' => 1,
      'cost' => [WOOD => 2],
   ],
   // --- gen php end improvements --- 
];

$this->traveler_types = [
   // --- gen php begin travelers --- 
   1 => [
      'name' => clienttranslate("Canada Lynx"),
      'timing' => "IMMEDIATELY",
   ],
   2 => [
      'name' => clienttranslate("Leopard Frog"),
      'timing' => "IMMEDIATELY",
   ],
   3 => [
      'name' => clienttranslate("Pileated Woodpecker"),
      'timing' => "ALL_MONTH_LONG",
   ],
   4 => [
      'name' => clienttranslate("Gray Wolf"),
      'timing' => "IMMEDIATELY",
   ],
   5 => [
      'name' => clienttranslate("Hairy-tailed Hole"),
      'timing' => "ALL_MONTH_LONG",
   ],
   6 => [
      'name' => clienttranslate("Common Raven"),
      'timing' => "IMMEDIATELY",
   ],
   7 => [
      'name' => clienttranslate("Striped Skunk"),
      'timing' => "ALL_MONTH_LONG",
   ],
   8 => [
      'name' => clienttranslate("American Beaver"),
      'timing' => "ALL_MONTH_LONG",
   ],
   9 => [
      'name' => clienttranslate("Common Loon"),
      'timing' => "IMMEDIATELY",
   ],
   10 => [
      'name' => clienttranslate("Snapping Turtle"),
      'timing' => "ALL_MONTH_LONG",
   ],
   11 => [
      'name' => clienttranslate("Pine Marten"),
      'timing' => "ALL_MONTH_LONG",
   ],
   12 => [
      'name' => clienttranslate("Black Bear"),
      'timing' => "ALL_MONTH_LONG",
   ],
   13 => [
      'name' => clienttranslate("Moose"),
      'timing' => "END_OF_MONTH",
   ],
   14 => [
      'name' => clienttranslate("Blue Jay"),
      'timing' => "END_OF_MONTH",
   ],
   15 => [
      'name' => clienttranslate("Wild Turkey"),
      'timing' => "AFTER_ROLLING_FAMILY_DICE",
   ],
   // --- gen php end travelers --- 
];

$this->valley_types = [
   // --- gen php begin valleys --- 
 1 => [ 
  'season' => SPRING,
  'type' => FOREST,
  'image_pos' => 3,
],
 2 => [ 
  'season' => SPRING,
  'type' => FOREST,
  'image_pos' => 4,
],
 3 => [ 
  'season' => SPRING,
  'type' => FOREST,
  'image_pos' => 5,
],
 4 => [ 
  'season' => SUMMER,
  'type' => FOREST,
  'image_pos' => 6,
],
 5 => [ 
  'season' => SUMMER,
  'type' => FOREST,
  'image_pos' => 7,
],
 6 => [ 
  'season' => SUMMER,
  'type' => FOREST,
  'image_pos' => 8,
],
 7 => [ 
  'season' => FALL,
  'type' => FOREST,
  'image_pos' => 1,
],
 8 => [ 
  'season' => FALL,
  'type' => FOREST,
  'image_pos' => 2,
],
 11 => [ 
  'season' => SPRING,
  'type' => MEADOW,
  'image_pos' => 3,
],
 12 => [ 
  'season' => SPRING,
  'type' => MEADOW,
  'image_pos' => 4,
],
 13 => [ 
  'season' => SPRING,
  'type' => MEADOW,
  'image_pos' => 5,
],
 14 => [ 
  'season' => SUMMER,
  'type' => MEADOW,
  'image_pos' => 6,
],
 15 => [ 
  'season' => SUMMER,
  'type' => MEADOW,
  'image_pos' => 7,
],
 16 => [ 
  'season' => SUMMER,
  'type' => MEADOW,
  'image_pos' => 8,
],
 17 => [ 
  'season' => FALL,
  'type' => MEADOW,
  'image_pos' => 1,
],
 18 => [ 
  'season' => FALL,
  'type' => MEADOW,
  'image_pos' => 2,
],
   // --- gen php end valleys --- 
];
