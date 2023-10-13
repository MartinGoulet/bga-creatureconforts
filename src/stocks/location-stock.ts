class LocationStock extends SlotStock<Meeple> {
   OnLocationClick: (slotId: SlotId) => void;
   private selectedLocations: SlotId[] = [];

   constructor(
      protected manager: CardManager<Meeple>,
      protected element: HTMLElement,
      settings: SlotStockSettings<Meeple>,
   ) {
      super(manager, element, settings);
      const handleMeepleClick = (meeple) => {
         if (this.OnLocationClick && this.slots[meeple.location_arg].classList.contains('selectable')) {
            this.OnLocationClick(meeple.location_arg);
         }
      };
      this.onCardClick = handleMeepleClick;
   }

   protected createSlot(slotId: SlotId): void {
      super.createSlot(slotId);
      const handleClick = (ev: MouseEvent) => {
         if (this.OnLocationClick && (ev.target as HTMLDivElement).classList.contains('selectable')) {
            this.OnLocationClick(slotId);
         }
      };
      (this.slots[slotId] as HTMLDivElement).addEventListener('click', handleClick);
   }

   public getSelectedLocation(): SlotId[] {
      return this.selectedLocations;
   }

   public isSelectedLocation(slotId: SlotId): boolean {
      return this.slots[Number(slotId)].classList.contains('selected');
   }

   public setSelectableLocation(locations: SlotId[] = []): void {
      this.slots.forEach((slot) => {
         slot.classList.toggle('selectable', false);
      });
      locations.forEach((sel) => this.slots[sel].classList.toggle('selectable', true));
   }

   public setSelectedLocation(locations: SlotId[] = []): void {
      this.selectedLocations = locations;
      this.slots.forEach((slot) => {
         slot.classList.toggle('selected', false);
      });
      locations.forEach((sel) => this.slots[sel].classList.toggle('selected', true));
      this.element.classList.toggle('has-selected-location', locations.length > 0);
   }
}
