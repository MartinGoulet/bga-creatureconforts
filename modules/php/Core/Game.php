<?php

namespace CreatureConforts\Core;


/*
 * Game: a wrapper over table object to allow more generic modules
 */
class Game extends \APP_DbObject {
    public static function get() {
        return \CreatureConforts::get();
    }
}
