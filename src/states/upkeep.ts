class UpkeepState implements StateHandler {
   constructor(private game: CreatureConforts) {}

   onEnteringState(args: any): void {
      this.game.tableCenter.clearReservedZones();
   }
   onLeavingState(): void {}
   onUpdateActionButtons(args: any): void {}
}
