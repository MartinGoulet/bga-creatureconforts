<?php

namespace CreatureConforts\Traits;

use CreatureConforts\Managers\Conforts;
use CreatureConforts\Managers\Improvements;
use CreatureConforts\Managers\Travelers;
use CreatureConforts\Managers\Valleys;

trait Debug {

    function setup() {
        self::DbQuery("DELETE FROM confort");
        self::DbQuery("DELETE FROM improvement");
        self::DbQuery("DELETE FROM traveler");
        self::DbQuery("DELETE FROM valley");
        Improvements::setup();
        Conforts::setup();
        Travelers::setup();
        Valleys::setup();
    }
}