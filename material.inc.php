<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * CreatureComforts implementation : © Martin Goulet <martin.goulet@live.ca>
 * 
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * material.inc.php
 *
 * CreatureComforts game material description
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
      'gametext' => clienttranslate("+ ::heart-1:: for each other BOARD GAME and TOYS Comfort you have"),
      'score' => 7,
      'cost' => [ANY_RESOURCE => 2, COIN => 1, STORY => 1],
      'class' => "BoardGame",
      'img' => [7, 14, 27],
   ],
   2 => [
      'name' => clienttranslate("Snowshoes"),
      'type' => OUTDOOR,
      'score' => 6,
      'cost' => [WOOD => 1, YARN => 2],
      'img' => 22,
   ],
   3 => [
      'name' => clienttranslate("Preserves"),
      'gametext' => clienttranslate("+ ::heart-2:: if you also have a PANTRY"),
      'type' => FOOD,
      'score' => 4,
      'cost' => [FRUIT => 3],
      'class' => "Preserves",
      'img' => 18,
   ],
   4 => [
      'name' => clienttranslate("Ice Skates"),
      'gametext' => clienttranslate("+ ::heart-2:: if you also have SOCKS"),
      'type' => OUTDOOR,
      'score' => 6,
      'cost' => [COIN => 2, YARN => 1],
      'class' => "IceSkates",
      'img' => 23,
   ],
   5 => [
      'name' => clienttranslate("Muffler"),
      'type' => CLOTHING,
      'score' => 5,
      'cost' => [WOOD => 1, YARN => 1, FRUIT => 1],
      'img' => 5,
   ],
   6 => [
      'name' => clienttranslate("Rocking Chair"),
      'gametext' => clienttranslate("+ ::heart-2:: if you also have a QUILT"),
      'score' => 5,
      'cost' => [WOOD => 3, YARN => 1],
      'class' => "RockingChair",
      'img' => 6,
   ],
   7 => [
      'name' => clienttranslate("Piggy Bank"),
      'gametext' => clienttranslate("+ ::heart-2:: for each ::coin:: stored here"),
      'score' => 3,
      'cost' => [STONE => 1, COIN => 2],
      'class' => "PiggyBank",
      'img' => 25,
   ],
   8 => [
      'name' => clienttranslate("Bookshelf"),
      'gametext' => clienttranslate("+ ::heart-3:: for each ::story:: stored here"),
      'score' => 6,
      'cost' => [WOOD => 2, STORY => 2],
      'class' => "Bookshelf",
      'img' => 3,
   ],
   9 => [
      'name' => clienttranslate("Pot of Tea"),
      'gametext' => clienttranslate("+ ::heart-2:: if you also have ROCKING CHAIR"),
      'score' => 4,
      'cost' => [FRUIT => 2, COIN => 1],
      'class' => "PotOfTea",
      'img' => 15,
   ],
   10 => [
      'name' => clienttranslate("Candles"),
      'type' => LIGHTING,
      'score' => 5,
      'cost' => [STONE => 1, YARN => 1, COIN => 1],
      'img' => 2,
   ],
   11 => [
      'name' => clienttranslate("Socks"),
      'type' => CLOTHING,
      'score' => 4,
      'cost' => [YARN => 2, FRUIT => 1],
      'img' => 19,
   ],
   12 => [
      'name' => clienttranslate("Pantry"),
      'gametext' => clienttranslate("+ ::heart-2:: for each set of ::grain:: ::mushroom:: ::fruit:: stored here"),
      'score' => 5,
      'cost' => [WOOD => 1, GRAIN => 1, MUSHROOM => 1, FRUIT => 1],
      'class' => "Pantry",
      'img' => 20,
      'storable' => [GRAIN, MUSHROOM, FRUIT],
   ],
   13 => [
      'name' => clienttranslate("Pie"),
      'type' => FOOD,
      'score' => 4,
      'cost' => [GRAIN => 2, FRUIT => 2],
      'img' => 4,
   ],
   14 => [
      'name' => clienttranslate("Stew"),
      'gametext' => clienttranslate("+ ::heart-2:: if you also have BREAD"),
      'type' => FOOD,
      'score' => 5,
      'cost' => [MUSHROOM => 4],
      'class' => "Stew",
      'img' => 11,
   ],
   15 => [
      'name' => clienttranslate("Flute"),
      'gametext' => clienttranslate("+ ::heart-2:: if you also have a MANDOLIN"),
      'score' => 4,
      'cost' => [WOOD => 1, COIN => 1],
      'class' => "Flute",
      'img' => 9,
   ],
   16 => [
      'name' => clienttranslate("Soup"),
      'type' => FOOD,
      'score' => 5,
      'cost' => [GRAIN => 2, MUSHROOM => 2],
      'img' => 13,
   ],
   17 => [
      'name' => clienttranslate("Fairy Garden"),
      'gametext' => clienttranslate("+ ::heart-8:: for each set of ::wood:: ::stone:: ::grain:: ::mushroom:: ::yarn:: ::fruit:: stored here"),
      'score' => 4,
      'cost' => [MUSHROOM => 2, COIN => 2],
      'class' => "FairyGarden",
      'img' => 8,
      'storable' => [WOOD, STONE, FRUIT, MUSHROOM, YARN, GRAIN],
   ],
   18 => [
      'name' => clienttranslate("Toys"),
      'score' => 6,
      'cost' => [WOOD => 1, STONE => 1, STORY => 1],
      'img' => 12,
   ],
   19 => [
      'name' => clienttranslate("Toboggan"),
      'gametext' => clienttranslate("+ ::heart-2:: if you also have a MUFFLER"),
      'type' => OUTDOOR,
      'score' => 5,
      'cost' => [WOOD => 2, YARN => 1],
      'class' => "Toboggan",
      'img' => 24,
   ],
   20 => [
      'name' => clienttranslate("Mandolin"),
      'score' => 6,
      'cost' => [WOOD => 2, COIN => 2],
      'img' => 26,
   ],
   21 => [
      'name' => clienttranslate("Quilt"),
      'type' => CLOTHING,
      'score' => 7,
      'cost' => [YARN => 1, COIN => 1, STORY => 1],
      'img' => 10,
   ],
   22 => [
      'name' => clienttranslate("Bread"),
      'gametext' => clienttranslate("+ ::heart-2:: if you also have SOUP"),
      'type' => FOOD,
      'score' => 4,
      'cost' => [GRAIN => 5],
      'class' => "Bread",
      'img' => 1,
   ],
   23 => [
      'name' => clienttranslate("Hearth"),
      'gametext' => clienttranslate("+ ::heart-2:: for each set of ::wood:: ::wood:: stored here"),
      'type' => LIGHTING,
      'score' => 6,
      'cost' => [WOOD => 2, STONE => 3],
      'class' => "Hearth",
      'img' => 16,
      'storable' => [WOOD],
   ],
   24 => [
      'name' => clienttranslate("Lamp"),
      'gametext' => clienttranslate("+ ::heart-7:: if you store exactly ::story:: ::story:: here"),
      'type' => LIGHTING,
      'score' => 4,
      'cost' => [STONE => 1, YARN => 1, COIN => 1],
      'class' => "Lamp",
      'img' => 17,
      'storable' => [STORY],
   ],
   // --- gen php end --- 
];

$this->improvement_types = [
   // --- gen php begin improvements ---
   1 => [
      'name' => clienttranslate("Barrel Sauna"),
      'img' => 17,
      'gametext' => clienttranslate("Gain ::heart-2:: for every ::type-outdoor:: Comfort owned by all ::keyword-{other}:: players"),
      'score' => 2,
      'cost' => [WOOD => 1, STONE => 1],
      'glade' => false,
      'power' => "Gain ::heart-2:: for every Outdoor Comfort owned by all other players",
      'solo' => false,
   ],
   2 => [
      'name' => clienttranslate("Writing Desk"),
      'img' => 12,
      'gametext' => clienttranslate("Gain ::heart-2:: for every ::type-lighting:: Comfort owned by all ::keyword-{other}:: players"),
      'score' => 2,
      'cost' => [WOOD => 1, STONE => 1],
      'glade' => false,
      'solo' => false,
   ],
   3 => [
      'name' => clienttranslate("Spinning Wheel"),
      'img' => 4,
      'gametext' => clienttranslate("Gain ::heart-2:: for every ::type-clothing:: Comfort owned by all ::keyword-{other}:: players"),
      'score' => 2,
      'cost' => [WOOD => 1, YARN => 1],
      'glade' => false,
      'solo' => false,
   ],
   4 => [
      'name' => clienttranslate("Bicycle"),
      'img' => 14,
      'gametext' => clienttranslate("At the start of your turn, you may move one of your workers to a different location"),
      'score' => 2,
      'cost' => [WOOD => 2, STONE => 1],
      'glade' => false,
      'solo' => true,
   ],
   5 => [
      'name' => clienttranslate("Pattern Book"),
      'img' => 16,
      'gametext' => clienttranslate("You may store one ::story:: on each of your ::type-clothing:: Comforts. The ::story:: add ::heart-4:: to the Comfort's score"),
      'score' => 3,
      'cost' => [YARN => 1, FRUIT => 1, STORY => 1],
      'glade' => false,
      'solo' => true,
   ],
   6 => [
      'name' => clienttranslate("Tool Shed"),
      'img' => 6,
      'gametext' => clienttranslate("When resolving a worker in the Workshop, treat your placed die's value as if it were 6"),
      'score' => 2,
      'cost' => [WOOD => 2],
      'glade' => false,
      'solo' => true,
   ],
   7 => [
      'name' => clienttranslate("Guest Cottage"),
      'img' => 5,
      'gametext' => clienttranslate("Owner may ::keyword-{not}:: place here. When another player collects, they ::keyword-{must}:: give a gift of ::any:: to the owner"),
      'score' => 4,
      'cost' => [WOOD => 1, STONE => 2, GRAIN => 1],
      'glade' => true,
      'glade_reward' => [STORY => 1, ANY_RESOURCE => 1],
      'solo' => false,
   ],
   8 => [
      'name' => clienttranslate("Orchard"),
      'img' => 2,
      'gametext' => clienttranslate("Owner gains ::fruit:: when ::keyword-{another}:: player collects"),
      'score' => 2,
      'cost' => [WOOD => 2, STONE => 1],
      'glade' => true,
      'glade_reward' => [FRUIT => 2],
      'solo' => true,
   ],
   9 => [
      'name' => clienttranslate("Umbrella"),
      'img' => 7,
      'gametext' => clienttranslate("Once each turn, you may add 1 or 2 to ::keyword-{one}:: of your Family dice"),
      'score' => 3,
      'cost' => [COIN => 2],
      'glade' => false,
      'solo' => true,
   ],
   10 => [
      'name' => clienttranslate("Almanac"),
      'img' => 1,
      'gametext' => clienttranslate("Gain on ::keyword-{Almanac token}::. Treat it as a permanent Lesson Learned, which you may use once per month"),
      'score' => 3,
      'cost' => [WOOD => 1, STONE => 1, COIN => 2],
      'glade' => false,
      'solo' => true,
   ],
   11 => [
      'name' => clienttranslate("Wheelbarrow"),
      'img' => 9,
      'gametext' => clienttranslate("Gain one ::keyword-{Wheelbarrow token}::. Each month you may place it with a worker in the Valley or River. That worker collects one extra ::any:: of a type being collected"),
      'score' => 2,
      'cost' => [WOOD => 2, COIN => 1],
      'glade' => false,
      'solo' => true,
   ],
   12 => [
      'name' => clienttranslate("Recipe Book"),
      'img' => 13,
      'gametext' => clienttranslate("You may store one ::story:: of each of your ::type-food:: Comforts. The ::story:: add ::heart-4:: to the Comfort's score"),
      'score' => 3,
      'cost' => [GRAIN => 1, MUSHROOM => 1, STORY => 1],
      'glade' => false,
      'solo' => true,
   ],
   13 => [
      'name' => clienttranslate("Weathervane"),
      'img' => 8,
      'gametext' => clienttranslate("Once each turn you mai raise or lower ::keyword-{one}:: Village die by 1. The die keeps its new value for the rest of the month"),
      'score' => 3,
      'cost' => [STONE => 2, COIN => 1],
      'glade' => false,
      'solo' => true,
   ],
   14 => [
      'name' => clienttranslate("Wildwood"),
      'img' => 11,
      'gametext' => clienttranslate("Owner gains ::mushroom:: when ::keyword-{another}:: player collects"),
      'score' => 2,
      'cost' => [WOOD => 2, STONE => 1],
      'glade' => true,
      'glade_reward' => [MUSHROOM => 2],
      'solo' => true,
   ],
   15 => [
      'name' => clienttranslate("Scale"),
      'img' => 3,
      'gametext' => clienttranslate("When visiting the Market, you may make ::keyword-{one}:: trade of ::any:: for ::any::. Then the usual rates apply"),
      'score' => 1,
      'cost' => [WOOD => 1, STONE => 2],
      'glade' => false,
      'solo' => true,
   ],
   16 => [
      'name' => clienttranslate("Field"),
      'img' => 19,
      'gametext' => clienttranslate("Owner gains ::grain:: when ::keyword-{another}:: player collects"),
      'score' => 2,
      'cost' => [WOOD => 1, STONE => 2],
      'glade' => true,
      'glade_reward' => [GRAIN => 2],
      'solo' => true,
   ],
   17 => [
      'name' => clienttranslate("Herb Garden"),
      'img' => 10,
      'gametext' => clienttranslate("Gain ::heart-1:: for every ::type-food:: Comfort owned by all ::keyword-{other}:: players"),
      'score' => 1,
      'cost' => [WOOD => 2],
      'glade' => false,
      'solo' => false,
   ],
   // --- gen php end improvements --- 
];

$this->traveler_types = [
   1 => [
      'name' => clienttranslate("Canada Lynx"),
      'gametext' => clienttranslate("In turn order each player must pick ::any:: ::different:: ::any:: from the supply to give the player on their left"),
      'timing' => "IMMEDIATELY",
      'img' => 16,
      'trade' => [
         1 => [
            "from" => ["count" => 2, "restriction" => "different"], "to" => ["resources" => [COIN]], "times" => 4
         ],
         2 => [
            "from" => ["count" => 2, "restriction" => "different"], "to" => ["resources" => [COIN]], "times" => 4
         ],
         3 => [
            "from" => ["count" => 2, "restriction" => "different"], "to" => ["resources" => [COIN]], "times" => 4
         ],
         4 => [
            "from" => ["count" => 2, "restriction" => "different"], "to" => ["resources" => [COIN]], "times" => 4
         ],
         5 => ["from" => ["count" => 0], "to" => ["resources" => [STORY]], "times" => 1],
         6 => ["from" => ["count" => 0], "to" => ["resources" => [STORY]], "times" => 1],
      ],
   ],
   2 => [
      'name' => clienttranslate("Leopard Frog"),
      'gametext' => clienttranslate("Place ::lesson:: ::lesson:: tokens from the supply here. Each player may use them on their turn. "),
      'timing' => "IMMEDIATELY",
      'img' => 3,
      'trade' => [
         1 => ["from" => ["count" => 1, "requirement" => [MUSHROOM]], "to" => ["count" => 1], "times" => 1],
         2 => ["from" => ["count" => 1, "requirement" => [MUSHROOM]], "to" => ["count" => 1], "times" => 2],
         3 => ["from" => ["count" => 1, "requirement" => [MUSHROOM]], "to" => ["count" => 1], "times" => 3],
         4 => ["from" => ["count" => 1, "requirement" => [MUSHROOM]], "to" => ["count" => 1], "times" => 4],
         5 => ["from" => ["count" => 1, "requirement" => [MUSHROOM]], "to" => ["count" => 1], "times" => 5],
         6 => ["from" => ["count" => 1, "requirement" => [MUSHROOM]], "to" => ["count" => 1], "times" => 6],
      ],
   ],
   3 => [
      'name' => clienttranslate("Pileated Woodpecker"),
      'gametext' => clienttranslate("All Improvements and Comforts cost one less ::wood:: than displayed on their cards"),
      'timing' => "ALL MONTH LONG",
      'img' => 12,
      'trade' => [
         1 => ["from" => ["count" => 1, "requirement" => [GRAIN]], "to" => ["resources" => [YARN, YARN]], "times" => 2],
         2 => ["from" => ["count" => 1, "requirement" => [GRAIN]], "to" => ["resources" => [YARN, YARN]], "times" => 2],
         3 => ["from" => ["count" => 1, "requirement" => [YARN]], "to" => ["resources" => [MUSHROOM, MUSHROOM]], "times" => 2],
         4 => ["from" => ["count" => 1, "requirement" => [YARN]], "to" => ["resources" => [MUSHROOM, MUSHROOM]], "times" => 2],
         5 => ["from" => ["count" => 1, "requirement" => [MUSHROOM]], "to" => ["resources" => [GRAIN, GRAIN]], "times" => 2],
         6 => ["from" => ["count" => 1, "requirement" => [MUSHROOM]], "to" => ["resources" => [GRAIN, GRAIN]], "times" => 2],
      ],
   ],
   4 => [
      'name' => clienttranslate("Gray Wolf"),
      'gametext' => clienttranslate("In turn order, each player may claim a face-up Comfort from the Owl's Nest, then refill the Owl's Nest"),
      'timing' => "IMMEDIATELY",
      'img' => 14,
      'trade' => [
         1 => [
            "from" => ["count" => 1, "requirement" => [COIN]],
            "to" => ["resources" => [LESSON_LEARNED, LESSON_LEARNED]],
            "times" => 1,
         ],
         2 => [
            "from" => ["count" => 1, "requirement" => [COIN]],
            "to" => ["resources" => [LESSON_LEARNED, LESSON_LEARNED]],
            "times" => 1,
         ],
         3 => ["from" => ["count" => 0], "to" => ["resources" => [COIN]], "times" => 1],
         4 => ["from" => ["count" => 0], "to" => ["resources" => [COIN]], "times" => 1],
         5 => ["from" => ["count" => 0], "to" => ["resources" => [COIN]], "times" => 1],
         6 => ["from" => ["count" => 1, "requirement" => [LESSON_LEARNED]], "to" => ["resources" => [STORY]], "times" => 2],
      ],
   ],
   5 => [
      'name' => clienttranslate("Hairy-tailed Hole"),
      'gametext' => clienttranslate("::stone:: and ::coin:: may be used as each other for any purpose"),
      'timing' => "ALL MONTH LONG",
      'reward' => [
         1 => ["from" => [STONE], 'to' => [ANY_RESOURCE], 'times' => 1],
         2 => ["from" => [STONE], 'to' => [ANY_RESOURCE], 'times' => 1],
         3 => ["from" => [STONE], 'to' => [ANY_RESOURCE], 'times' => 1],
         4 => ["from" => [STONE, STONE], 'to' => [STORY], 'times' => 3],
         5 => ["from" => [STONE, STONE], 'to' => [STORY], 'times' => 3],
         6 => ["from" => [STONE, STONE], 'to' => [STORY], 'times' => 3],
      ],
      'img' => 2,
      'trade' => [
         1 => ["from" => ["count" => 1, "requirement" => [STONE]], "to" => ["count" => 1], "times" => 1],
         2 => ["from" => ["count" => 1, "requirement" => [STONE]], "to" => ["count" => 1], "times" => 2],
         3 => ["from" => ["count" => 1, "requirement" => [STONE]], "to" => ["count" => 1], "times" => 3],
         4 => ["from" => ["count" => 2, "requirement" => [STONE, STONE]], "to" => ["resources" => [STORY]], "times" => 3],
         5 => ["from" => ["count" => 2, "requirement" => [STONE, STONE]], "to" => ["resources" => [STORY]], "times" => 3],
         6 => ["from" => ["count" => 2, "requirement" => [STONE, STONE]], "to" => ["resources" => [STORY]], "times" => 3],
      ],
   ],
   6 => [
      'name' => clienttranslate("Common Raven"),
      'gametext' => clienttranslate("In turn order, each player places ::coin:: from the supply in a different location. This month, those locations provide ::coin:: in addition to what they show"),
      'timing' => "IMMEDIATELY",
      'img' => 9,
      'trade' => [
         1 => ["from" => ["count" => 1, "requirement" => [COIN]], "to" => ["resources" => [STORY]], "times" => 2],
         2 => ["from" => ["count" => 1, "requirement" => [COIN]], "to" => ["resources" => [STORY]], "times" => 2],
         3 => ["from" => ["count" => 1, "requirement" => [COIN]], "to" => ["resources" => [CARD, LESSON_LEARNED]], "times" => 1],
         4 => ["from" => ["count" => 1, "requirement" => [GRAIN]], "to" => ["resources" => [COIN]], "times" => 3],
         5 => ["from" => ["count" => 1, "requirement" => [GRAIN]], "to" => ["resources" => [COIN]], "times" => 3],
         6 => ["from" => ["count" => 1, "requirement" => [GRAIN]], "to" => ["resources" => [COIN]], "times" => 3],
      ],
   ],
   7 => [
      'name' => clienttranslate("Striped Skunk"),
      'gametext' => clienttranslate("After visiting the Owl's Nest, you may search through the discard pile and claim one Comfort of your choice"),
      'timing' => "ALL MONTH LONG",
      'img' => 15,
      'trade' => [
         1 => ["from" => ["count" => 0], "to" => ["resources" => [STORY]], "times" => 1],
         2 => ["from" => ["count" => 1, "requirement" => [CARD]], "to" => ["count" => 2], "times" => 2],
         3 => ["from" => ["count" => 1, "requirement" => [CARD]], "to" => ["count" => 2], "times" => 2],
         4 => ["from" => ["count" => 1, "requirement" => [CARD]], "to" => ["count" => 2], "times" => 2],
         5 => ["from" => ["count" => 1, "requirement" => [CARD]], "to" => ["count" => 2], "times" => 2],
         6 => ["from" => ["count" => 2, "requirement" => [CARD, CARD]], "to" => ["resources" => [COIN, STORY]], "times" => 2],
      ],
   ],
   8 => [
      'name' => clienttranslate("American Beaver"),
      'gametext' => clienttranslate("Both Forest locations provide ::wood:: ::wood:: in addition to what they show"),
      'timing' => "ALL MONTH LONG",
      'img' => 11,
      'trade' => [
         1 => ["from" => ["count" => 1, "requirement" => [WOOD]], "to" => ["resources" => [COIN]], "times" => 1],
         2 => ["from" => ["count" => 1, "requirement" => [WOOD]], "to" => ["resources" => [COIN]], "times" => 2],
         3 => ["from" => ["count" => 1, "requirement" => [WOOD]], "to" => ["resources" => [COIN]], "times" => 3],
         4 => ["from" => ["count" => 2, "requirement" => [WOOD]], "to" => ["resources" => [STORY]], "times" => 3],
         5 => ["from" => ["count" => 2, "requirement" => [WOOD]], "to" => ["resources" => [STORY]], "times" => 3],
         6 => ["from" => ["count" => 2, "requirement" => [WOOD]], "to" => ["resources" => [STORY]], "times" => 3],
      ],
   ],
   9 => [
      'name' => clienttranslate("Common Loon"),
      'gametext' => clienttranslate("All players pass one worker to the player on their left. During Placement, you must place the neighbor's worker before placing the rest of you own"),
      'timing' => "IMMEDIATELY",
      'img' => 4,
      'trade' => [
         1 => ["from" => ["count" => 0], "to" => ["resources" => [LESSON_LEARNED, LESSON_LEARNED]], "times" => 1],
         2 => ["from" => ["count" => 0], "to" => ["resources" => [LESSON_LEARNED, LESSON_LEARNED]], "times" => 1],
         3 => ["from" => ["count" => 1, "restriction" => "all_different"], "to" => ["count" => 1, "restriction" => "all_same"], "times" => 3],
         4 => ["from" => ["count" => 1, "restriction" => "all_different"], "to" => ["count" => 1, "restriction" => "all_same"], "times" => 4],
         5 => ["from" => ["count" => 1, "restriction" => "all_different"], "to" => ["count" => 1, "restriction" => "all_same"], "times" => 5],
         6 => ["from" => ["count" => 1, "restriction" => "all_different"], "to" => ["count" => 1, "restriction" => "all_same"], "times" => 6],
      ],
   ],
   10 => [
      'name' => clienttranslate("Snapping Turtle"),
      'gametext' => clienttranslate("Every unresolved worker earns two more ::lesson:: tokens than usual"),
      'timing' => "ALL MONTH LONG",
      'img' => 8,
      'trade' => [
         1 => ["from" => ["count" => 1, "requirement" => [STORY]], "to" => ["count" => 3], "times" => 1],
         2 => ["from" => ["count" => 1, "requirement" => [STORY]], "to" => ["count" => 3], "times" => 1],
         3 => ["from" => ["count" => 1, "requirement" => [STORY]], "to" => ["count" => 3], "times" => 1],
         3 => ["from" => ["count" => 1, "requirement" => [CARD]], "to" => ["resources" => [COIN, COIN]], "times" => 1],
         4 => ["from" => ["count" => 1, "requirement" => [COIN]], "to" => ["resources" => [STORY]], "times" => 1],
         5 => ["from" => ["count" => 1, "requirement" => [COIN]], "to" => ["resources" => [STORY]], "times" => 1],
         6 => ["from" => ["count" => 1, "requirement" => [COIN]], "to" => ["resources" => [STORY]], "times" => 1],
      ],
   ],
   11 => [
      'name' => clienttranslate("Pine Marten"),
      'gametext' => clienttranslate("Worker may may not be sent to Forest locations. On your turn you may assign dice to resolve Forest locations as if you had sent a worker there"),
      'timing' => "ALL MONTH LONG",
      'img' => 7,
      'trade' => [
         1 => ["from" => ["count" => 1], "to" => ["resources" => [WOOD]], "times" => 5],
         2 => ["from" => ["count" => 1], "to" => ["resources" => [WOOD]], "times" => 5],
         3 => ["from" => ["count" => 1], "to" => ["resources" => [WOOD]], "times" => 5],
         4 => ["from" => ["count" => 1, "requirement" => [LESSON_LEARNED]], "to" => ["resources" => [COIN]], "times" => 3],
         5 => ["from" => ["count" => 1, "requirement" => [LESSON_LEARNED]], "to" => ["resources" => [COIN]], "times" => 3],
         6 => ["from" => ["count" => 2, "requirement" => [FRUIT, MUSHROOM]], "to" => ["resources" => [STORY]], "times" => 3],
      ],
   ],
   12 => [
      'name' => clienttranslate("Black Bear"),
      'gametext' => clienttranslate("All four Valley locations provide ::fruit:: in addition to what they show"),
      'timing' => "ALL MONTH LONG",
      'img' => 13,
      'trade' => [
         1 => ["from" => ["count" => 1, "requirement" => [FRUIT]], "to" => ["count" => 1], "times" => 1],
         2 => ["from" => ["count" => 1, "requirement" => [FRUIT]], "to" => ["count" => 1], "times" => 2],
         3 => ["from" => ["count" => 1, "requirement" => [FRUIT]], "to" => ["count" => 1], "times" => 3],
         4 => ["from" => ["count" => 0], "to" => ["resources" => [STORY]], "times" => 1],
         5 => ["from" => ["count" => 0], "to" => ["resources" => [STORY]], "times" => 1],
         6 => ["from" => ["count" => 1, "requirement" => [FRUIT]], "to" => ["resources" => [COIN]], "times" => 3],
      ],
   ],
   13 => [
      'name' => clienttranslate("Moose"),
      'gametext' => clienttranslate("In turn order, each player may gain ::story:: from the supply if they give a gift of ::any:: to another player"),
      'timing' => "END OF MONTH",
      'img' => 1,
      'trade' => [
         1 => ["from" => ["count" => 1, "requirement" => [COIN]], "to" => ["count" => 2, "restriction" => "different"], "times" => 2],
         2 => ["from" => ["count" => 1, "requirement" => [COIN]], "to" => ["count" => 2, "restriction" => "different"], "times" => 2],
         3 => ["from" => ["count" => 0], "to" => ["resources" => [STORY]], "times" => 1],
         4 => ["from" => ["count" => 2, "restriction" => "same"], "to" => ["resources" => [STORY, STORY]], "times" => 2],
         5 => ["from" => ["count" => 2, "restriction" => "same"], "to" => ["resources" => [STORY, STORY]], "times" => 2],
         6 => ["from" => ["count" => 2, "restriction" => "same"], "to" => ["resources" => [STORY, STORY]], "times" => 2],
      ],
   ],
   14 => [
      'name' => clienttranslate("Blue Jay"),
      'gametext' => clienttranslate("Each player may resolve one Valley location of their choice using the Village dice only, as if they'd sent a worker there"),
      'timing' => "END OF MONTH",
      'img' => 5,
      'trade' => [
         1 => ["from" => ["count" => 0], "to" => ["resources" => [COIN, COIN]], "times" => 1],
         2 => ["from" => ["count" => 0], "to" => ["resources" => [COIN, COIN]], "times" => 1],
         3 => ["from" => ["count" => 1, "requirement" => [COIN]], "to" => ["resources" => [STORY]], "times" => 2],
         4 => ["from" => ["count" => 1, "requirement" => [COIN]], "to" => ["resources" => [STORY]], "times" => 2],
         5 => ["from" => ["count" => 1, "requirement" => [COIN]], "to" => ["resources" => [STORY]], "times" => 2],
         6 => ["from" => ["count" => 1, "requirement" => [COIN]], "to" => ["resources" => [STORY]], "times" => 2],
      ],
   ],
   15 => [
      'name' => clienttranslate("Wild Turkey"),
      'gametext' => clienttranslate("Each player may change one of their own Family dice to any result they wish"),
      'timing' => "AFTER ROLLING FAMILY DICE",
      'img' => 6,
      'trade' => [
         1 => ["from" => ["count" => 0], "to" => ["resources" => [CARD, STORY]], "times" => 1],
         2 => ["from" => ["count" => 0], "to" => ["resources" => [MUSHROOM, GRAIN, FRUIT]], "times" => 1],
         3 => ["from" => ["count" => 0], "to" => ["resources" => [MUSHROOM, GRAIN, FRUIT]], "times" => 1],
         4 => ["from" => ["count" => 1], "to" => ["count" => 1], "times" => 4],
         5 => ["from" => ["count" => 1], "to" => ["count" => 1], "times" => 5],
         6 => ["from" => ["count" => 1], "to" => ["count" => 1], "times" => 6],
      ],
   ],
];

$this->valley_types = [
   1 => [
      'season' => SPRING,
      'type' => FOREST,
      'image_pos' => 3,
      'position' => [
         1 => [
            "count" => 1,
            "rule" => RULE_3_OR_UNDER,
            "resources" => [WOOD => 1]
         ],
         2 => [
            "count" => 2,
            "rule" => RULE_TOTAL_5_OR_LOWER,
            "resources" => [WOOD => 2, MUSHROOM => 2]
         ],
      ],
   ],
   2 => [
      'season' => SPRING,
      'type' => FOREST,
      'image_pos' => 4,
      'position' => [
         1 => [
            "count" => 1,
            "values" => [4],
            "resources" => [MUSHROOM => 2],
         ],
         2 => [
            "count" => 2,
            "values" => [5, 6],
            "resources" => [WOOD => 2, FRUIT => 1],
         ],
      ],
   ],
   3 => [
      'season' => SPRING,
      'type' => FOREST,
      'image_pos' => 5,
      'position' => [
         1 => [
            "count" => -1,
            "rule" => RULE_TOTAL_11_OR_HIGHER,
            "resources" => [WOOD => 2, MUSHROOM => 1],
         ],
         2 => [
            "count" => 2,
            "values" => [3, 4],
            "resources" => [MUSHROOM => 2, FRUIT => 1],
         ],
      ]
   ],
   4 => [
      'season' => SUMMER,
      'type' => FOREST,
      'image_pos' => 6,
      'position' => [
         1 => [
            "count" => 1,
            "values" => [3],
            "resources" => [WOOD => 2],
         ],
         2 => [
            "count" => 2,
            "rule" => RULE_SAME_VALUE,
            "resources" => [WOOD => 1, COIN => 1],
         ],
      ],
   ],
   5 => [
      'season' => SUMMER,
      'type' => FOREST,
      'image_pos' => 7,
      'position' => [
         1 => [
            "count" => 3,
            "rule" => RULE_SAME_VALUE,
            "resources" => [COIN => 3],
         ],
         2 => [
            "count" => 3,
            "rule" => RULE_TOTAL_11_OR_HIGHER,
            "resources" => [WOOD => 3, FRUIT => 1],
         ],
      ],
   ],
   6 => [
      'season' => SUMMER,
      'type' => FOREST,
      'image_pos' => 8,
      'position' => [
         1 => [
            "count" => 1,
            "rule" => RULE_4_OR_HIGHER,
            "resources" => [WOOD => 1],
         ],
         2 => [
            "count" => 3,
            "rule" => RULE_ALL_EVEN,
            "resources" => [WOOD => 1, FRUIT => 2, COIN => 1],
         ],
      ],
   ],
   7 => [
      'season' => FALL,
      'type' => FOREST,
      'image_pos' => 1,
      'position' => [
         1 => [
            "count" => 2,
            "rule" => RULE_TOTAL_5_OR_LOWER,
            "resources" => [WOOD => 1, MUSHROOM => 1],
         ],
         2 => [
            "count" => 2,
            "rule" => RULE_SAME_VALUE,
            "resources" => [WOOD => 1, FRUIT => 2],
         ],
      ],
   ],
   8 => [
      'season' => FALL,
      'type' => FOREST,
      'image_pos' => 2,
      'position' => [
         1 => [
            "count" => 1,
            "values" => [6],
            "resources" => [WOOD => 1, FRUIT => 1],
         ],
         2 => [
            "count" => 2,
            "rule" => RULE_ALL_EVEN,
            "resources" => [WOOD => 1, MUSHROOM => 2],
         ],
      ],
   ],
   11 => [
      'season' => SPRING,
      'type' => MEADOW,
      'image_pos' => 3,
      'position' => [
         3 => [
            "count" => 2,
            "rule" => RULE_SAME_VALUE,
            "resources" => [FRUIT => 2],
         ],
         4 => [
            "count" => 2,
            "rule" => RULE_TOTAL_7_OR_HIGHER,
            "resources" => [YARN => 1, COIN => 1],
         ],
      ],
   ],
   12 => [
      'season' => SPRING,
      'type' => MEADOW,
      'image_pos' => 4,
      'position' => [
         3 => [
            "count" => 3,
            "rule" => RULE_STRAIGHT,
            "resources" => [STORY => 2, COIN => 1],
         ],
         4 => [
            "count" => 2,
            "values" => [1, 2],
            "resources" => [FRUIT => 1, YARN => 1],
         ],
      ],
   ],
   13 => [
      'season' => SPRING,
      'type' => MEADOW,
      'image_pos' => 5,
      'position' => [
         3 => [
            "count" => 2,
            "rule" => RULE_TOTAL_8,
            "resources" => [YARN => 2],
         ],
         4 => [
            "count" => 1,
            "values" => [2],
            "resources" => [STORY => 1],
         ],
      ],
   ],
   14 => [
      'season' => SUMMER,
      'type' => MEADOW,
      'image_pos' => 6,
      'position' => [
         3 => [
            "count" => 2,
            "rule" => RULE_TOTAL_10_OR_HIGHER,
            "resources" => [GRAIN => 1, FRUIT => 1, YARN => 1],
         ],
         4 => [
            "count" => 3,
            "rule" => RULE_ALL_EVEN,
            "resources" => [GRAIN => 4],
         ],
      ],
   ],
   15 => [
      'season' => SUMMER,
      'type' => MEADOW,
      'image_pos' => 7,
      'position' => [
         3 => [
            "count" => 3,
            "rule" => RULE_STRAIGHT,
            "resources" => [YARN => 2, STORY => 1],
         ],
         4 => [
            "count" => 2,
            "rule" => RULE_SAME_VALUE,
            "resources" => [GRAIN => 1, FRUIT => 1],
         ],
      ],
   ],
   16 => [
      'season' => SUMMER,
      'type' => MEADOW,
      'image_pos' => 8,
      'position' => [
         3 => [
            "count" => 2,
            "rule" => RULE_SAME_VALUE,
            "resources" => [YARN => 1, GRAIN => 1],
         ],
         4 => [
            "count" => 2,
            "rule" => RULE_STRAIGHT,
            "resources" => [GRAIN => 2],
         ],
      ],
   ],
   17 => [
      'season' => FALL,
      'type' => MEADOW,
      'image_pos' => 1,
      'position' => [
         3 => [
            "count" => 3,
            "rule" => RULE_TOTAL_6_OR_LOWER,
            "resources" => [STORY => 2]
         ],
         4 => [
            "count" => 2,
            "rule" => RULE_TOTAL_7,
            "resources" => [GRAIN => 2, FRUIT => 2],
         ],
      ],
   ],
   18 => [
      'season' => FALL,
      'type' => MEADOW,
      'image_pos' => 2,
      'position' => [
         3 => [
            "count" => 1,
            "values" => [5],
            "resources" => [STORY => 1],
         ],
         4 => [
            "count" => 2,
            "rule" => RULE_ALL_ODD,
            "resources" => [GRAIN => 2],
         ],
      ],
   ],
];

$this->good_types = [
   1 => WOOD,
   2 => STONE,
   3 => FRUIT,
   4 => MUSHROOM,
   5 => YARN,
   6 => GRAIN,
];

$this->resource_types = [
   1 => WOOD,
   2 => STONE,
   3 => FRUIT,
   4 => MUSHROOM,
   5 => YARN,
   6 => GRAIN,
   7 => LESSON_LEARNED,
   8 => STORY,
   9 => COIN,
   10 => CARD,
];
