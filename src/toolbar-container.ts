class ToolbarContainer {
   constructor(public readonly name: string) {
      this.name = `resource_manager_${name}`;
   }

   addContainer() {
      this.removeContainer();
      document
         .getElementById(`maintitlebar_content`)
         .insertAdjacentHTML('beforeend', `<div id="${this.name}" class="cc-toolbar"></div>`);
      return this.getContainer();
   }

   removeContainer() {
      const element = document.getElementById(this.name);
      if (element) element.remove();
   }

   getContainer(): HTMLElement {
      return document.getElementById(this.name);
   }
}
