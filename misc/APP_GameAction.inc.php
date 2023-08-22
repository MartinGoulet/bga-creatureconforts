<?php

abstract class APP_GameAction extends APP_Action
{
    /**
     * @var \CreatureConforts
     */
    protected $game;

    /**
     * @param \CreatureConforts $game
     */
    public function stubGame(\CreatureConforts $game)
    {
        $this->game = $game;
    }

    /**
     * @return \CreatureConforts
     */
    public function getGame()
    {
        return $this->game;
    }

    /**
     * @param int $activePlayerId
     * @return self
     */
    public function stubActivePlayerId($activePlayerId)
    {
        return $this;
    }

    protected static function ajaxResponse($dummy = '')
    {
        if ($dummy != '') {
            throw new InvalidArgumentException("Game action cannot return any data");
        }
    }
}