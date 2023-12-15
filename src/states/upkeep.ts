class UpkeepState implements StateHandler {
   constructor(private game: CreatureComforts) {}

   onEnteringState(args: any): void {
      this.game.tableCenter.clearReservedZones();
   }
   onLeavingState(): void {}
   onUpdateActionButtons(args: any): void {}
}
