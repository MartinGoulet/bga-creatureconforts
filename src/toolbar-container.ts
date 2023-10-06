class ToolbarContainer {
   private readonly container_name: string;

   constructor(name: string) {
      this.container_name = `resource_manager_${name}`;
   }

   addContainer() {
      this.removeContainer();
      document
         .getElementById(`maintitlebar_content`)
         .insertAdjacentHTML('beforeend', `<div id="${this.container_name}"></div>`);
      return this.getContainer();
   }

   removeContainer() {
      const element = document.getElementById(this.container_name);
      if (element) element.remove();
   }

   getContainer(): HTMLElement {
      return document.getElementById(this.container_name);
   }
}
