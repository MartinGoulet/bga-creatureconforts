class ResourceHelper {
   static getElement<TResource>(type: TResource) {
      return `<div class="resource-icon" data-type="${type}"></div>`;
   }
   static getIconSame() {
      return '<div class="resource-icon same"></div>';
   }
   static getIconDifferent() {
      return '<div class="resource-icon different"></div>';
   }
   static convertToInt(icons: IconsType[]): number[] {
      return icons.map((type) => ICONS.indexOf(type) + 1);
   }
}
