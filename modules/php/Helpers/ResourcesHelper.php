<?php

namespace CreatureComforts\Helpers;

use CreatureComforts\Core\Game;

class ResourcesHelper {

    static function convertNumberToResource($resources) {
        $resource_types = Game::get()->resource_types;
        return array_map(function($no) use($resource_types) {
            return $resource_types[$no];
        }, $resources);
    }

    static function groupByType($resources) {
        $group = [];
        foreach ($resources as $resource) {
            if (!array_key_exists($resource, $group)) {
                $group[$resource] = 1;
            } else {
                $group[$resource] += 1;
            }
        }
        return $group;
    }

    static function isGroupLimitedTo($group, $limitedTo) {
        foreach (array_keys($group) as $resource) {
            if(!in_array($resource, $limitedTo)) {
                return false;
            }
        }
        return true;
    }
}
