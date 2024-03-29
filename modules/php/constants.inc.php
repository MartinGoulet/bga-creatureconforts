<?php

/*
 * Statistic variables 
 */
const STAT_TURN_NUMBER = "turns_number";

/*
 * Game options
 */

const OPTION_SHORT_GAME = "short_game";
const OPTION_SHORT_GAME_ID = 101;
const OPTION_SHORT_GAME_ENABLED = 0;
const OPTION_SHORT_GAME_DISABLED = 1;

/**
 * States
 */
const ST_BGA_GAME_SETUP = 1;
const ST_END_GAME = 99;

const ST_START_HAND = 2;
const ST_START_HAND_DISCARD = 3;

const ST_NEW_TRAVELER = 10;

const ST_FAMILY_DICE = 20;

const ST_PLACEMENT = 30;
const ST_PLACEMENT_END = 31;

const ST_VILLAGE_DICE = 40;

const ST_PLAYER_TURN_START = 49;
const ST_PLAYER_TURN_DICE = 50;
const ST_PLAYER_TURN_RESOLVE = 51;
const ST_PLAYER_TURN_NEXT = 52;
const ST_PLAYER_TURN_CRAFT_CONFORT = 53;
const ST_PLAYER_TURN_END = 54;
const ST_PLAYER_TURN_DISCARD = 55;
const ST_PLAYER_RETURN_UNRESOLVED_WORKER = 56;

const ST_PRE_UPKEEP = 59;
const ST_UPKEEP = 60;

const ST_IMPROVEMENT_BICYCLE = 80;

const ST_START_TURN = 90;

const ST_PRE_END_OF_GAME = 95;
const ST_PRE_END_OF_GAME_SCORING = 96;

const ST_GRAY_WOLF = 170;
const ST_GRAY_WOLF_NEXT_PLAYER = 171;
const ST_COMMON_RAVEN = 172;
const ST_COMMON_RAVEN_NEXT_PLAYER = 173;
const ST_STRIPED_SKUNK = 174;
const ST_COMMON_LOON = 175;
const ST_COMMON_LOON_END = 176;
const ST_WILD_TURKEY = 177;
const ST_WILD_TURKEY_END = 178;
const ST_CANADA_LYNX = 179;
const ST_CANADA_LYNX_NEXT_PLAYER = 180;
const ST_MOOSE = 181;
const ST_MOOSE_NEXT_PLAYER = 182;
const ST_BLUE_JAY = 183;
const ST_BLUE_JAY_END = 184;

/**
 * Goods tokens
 */

const WOOD = "wood";
const STONE = "stone";
const FRUIT = "fruit";
const MUSHROOM = "mushroom";
const YARN = "yarn";
const GRAIN = "grain";

const ANY_RESOURCE = "*";
const GOODS = [WOOD, STONE, FRUIT, MUSHROOM, YARN, GRAIN];

/**
 * Tokens
 */
const COIN = "coin";
const STORY = "story";
const LESSON_LEARNED = "lesson";

const CARD = 'card';

/**
 * Comfort type
 */

const CLOTHING = "clothing";
const FOOD = "food";
const LIGHTING = "lighting";
const OUTDOOR = "outdoor";

/**
 * Valley
 */
const SPRING = "spring";
const SUMMER = "summer";
const FALL = "fall";

const FOREST = "forest";
const MEADOW = "meadow";

const RULE_3_OR_UNDER = "3_OR_UNDER";
const RULE_4_OR_HIGHER = "4_OR_HIGHER";
const RULE_TOTAL_5_OR_LOWER = "TOTAL_5_OR_LOWER";
const RULE_TOTAL_6_OR_LOWER = "TOTAL_6_OR_LOWER";
const RULE_TOTAL_7_OR_HIGHER = "TOTAL_7_OR_HIGHER";
const RULE_TOTAL_10_OR_HIGHER = "TOTAL_10_OR_HIGHER";
const RULE_TOTAL_11_OR_HIGHER = "TOTAL_11_OR_HIGHER";
const RULE_TOTAL_7 = "TOTAL_7";
const RULE_TOTAL_8 = "TOTAL_8";
const RULE_SAME_VALUE = "SAME_VALUE";
const RULE_ALL_EVEN = "ALL_EVEN";
const RULE_ALL_ODD = "ALL_ODD";
const RULE_STRAIGHT = "STRAIGHT";


/*
 * Global variables
 */
const VAR_FIRST_PLAYER = 'first_player';
const VAR_RIVER_DIAL = 'river_dial';
const VAR_SAVEPOINT_TRANSITION = 'savepoint_transition';
const VAR_MARKET_USED = 'market_used';
