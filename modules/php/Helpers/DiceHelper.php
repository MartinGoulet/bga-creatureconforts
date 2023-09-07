<?php

namespace CreatureConforts\Helpers;

use BgaUserException;
use CreatureConforts\Core\Globals;
use CreatureConforts\Managers\Dice;
use CreatureConforts\Managers\Valleys;


interface DiceRequirement {
    public function isRequirementMet(array $values): bool;
}

class DiceHelper {

    public static function isRequirementMet(int $location_id, array $dice_ids) {
        if (sizeof($dice_ids) == 0) return true;

        /** @var DiceRequirement */
        $requirement = null;

        if ($location_id >= 1 && $location_id <= 4) {
            $info = Valleys::getValleyLocationInfo($location_id);
            // If number of dice is required, we reject if not all dice are present
            if ($info['count'] > 0 && $info['count'] !== sizeof($dice_ids)) return false;
            // Get requirement
            $requirement = self::getValleyRequirement($info);
            return $requirement->isRequirementMet(self::getDiceValue($dice_ids));
        } else if ($location_id >= 5 && $location_id <= 7) {
            $requirement = new DialRequirement(Globals::getRiverDialValue(), $location_id);
            return $requirement->isRequirementMet(self::getDiceValue($dice_ids));
        }

        return true;

    }

    private static function getDiceValue($dice_ids) {
        $dice = Dice::getDice($dice_ids);
        $dice_values = array_map(function ($die) {
            return $die['face'];
        }, $dice);
        sort($dice_values);
        return $dice_values;
    }

    private static function getValleyRequirement(array $info): DiceRequirement {
        if (array_key_exists('values', $info)) {
            return new ValuesRequirement($info['values']);
        }

        switch ($info['rule']) {
            case RULE_3_OR_UNDER:
                return new ValueTotalLowerRequirement(3);
            case RULE_4_OR_HIGHER:
                return new ValueTotalHigherRequirement(4);
            case RULE_TOTAL_5_OR_LOWER:
                return new ValueTotalLowerRequirement(7);
            case RULE_TOTAL_6_OR_LOWER:
                return new ValueTotalLowerRequirement(7);
            case RULE_TOTAL_7_OR_HIGHER:
                return new ValueTotalHigherRequirement(7);
            case RULE_TOTAL_10_OR_HIGHER:
                return new ValueTotalHigherRequirement(10);
            case RULE_TOTAL_11_OR_HIGHER:
                return new ValueTotalHigherRequirement(11);
            case RULE_TOTAL_7:
                return new ValueTotalExactRequirement(7);
            case RULE_TOTAL_8:
                return new ValueTotalExactRequirement(8);
            case RULE_SAME_VALUE:
                return new SameValueRequirement();
            case RULE_ALL_EVEN:
                return new AllEvenRequirement();
            case RULE_ALL_ODD:
                return new AllOddRequirement();
            case RULE_STRAIGHT:
                return new StraightRequirement();
        }

        throw new BgaUserException("Rule not implemented");
    }
}

class ValuesRequirement implements DiceRequirement {
    /** @var array */
    private $values;

    public function __construct(array $values) {
        $this->values = $values;
    }

    function isRequirementMet(array $values): bool {
        return sizeof(array_diff($values, $this->values)) == 0;
    }
}

class ValueTotalBase {
    /** @var int */
    protected $total;

    public function __construct(int $total) {
        $this->total = $total;
    }
}

class ValueTotalExactRequirement extends ValueTotalBase implements DiceRequirement {
    function isRequirementMet(array $values): bool {
        return array_sum($values) == $this->total;
    }
}

class ValueTotalLowerRequirement extends ValueTotalBase implements DiceRequirement {
    function isRequirementMet(array $values): bool {
        return array_sum($values) <= $this->total;
    }
}

class ValueTotalHigherRequirement extends ValueTotalBase implements DiceRequirement {
    function isRequirementMet(array $values): bool {
        return array_sum($values) >= $this->total;
    }
}

class SameValueRequirement implements DiceRequirement {
    function isRequirementMet(array $values): bool {
        return count(array_unique($values, SORT_REGULAR)) == 1;
    }
}

class AllEvenRequirement implements DiceRequirement {
    function isRequirementMet(array $values): bool {
        return count(array_filter($values, function ($val) {
            return $val % 2 == 0;
        })) == count($values);
    }
}

class AllOddRequirement implements DiceRequirement {
    function isRequirementMet(array $values): bool {
        return count(array_filter($values, function ($val) {
            return $val % 2 == 1;
        })) == count($values);
    }
}

class StraightRequirement implements DiceRequirement {
    function isRequirementMet(array $values): bool {
        for ($i = 1; $i < count($values); $i++) {
            if ($values[$i] !== $values[$i - 1] + 1) return false;
        }
        return true;
    }
}

class DialRequirement implements DiceRequirement {
    /** @var int */
    private $dial;
    /** @var int */
    private $location_id;

    public function __construct(int $dial, int $location_id) {
        $this->dial = $dial;
        $this->location_id = $location_id;
    }

    function isRequirementMet(array $values): bool {
        $dieValue = intval($values[0]);

        switch ($this->location_id) {
            case 5:
                return $dieValue == $this->dial;
            case 6:
                $baseValue = ($this->dial + 1) % 6;
                return $dieValue == $baseValue
                    || $dieValue == $baseValue + 1;
            case 7:
                $baseValue = ($this->dial + 3) % 6;
                return $dieValue == $baseValue
                    || $dieValue == $baseValue + 1
                    || $dieValue == $baseValue + 2;
            default:
                return false;
        }
    }
}
