interface IResourceManager<TResource> {
   getResourcesFrom(): TResource[];
   getResourcesTo(): TResource[];
   reset(): void;
}

interface ICounter {
   getValue(): number;
   create(id: string | HTMLElement): void;
   setValue(value: number): void;
   incValue(value: number): void;
}
