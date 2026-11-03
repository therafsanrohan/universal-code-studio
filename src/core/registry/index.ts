/**
 * Format registry — the single source of truth for tool discovery.
 * See docs/ARCHITECTURE.md §6.
 */

import type { FormatAdapter, FormatCapability, FormatCategory, Operation } from '../types';

class FormatRegistry {
  private readonly adapters = new Map<string, FormatAdapter>();

  /** Register an adapter. Duplicates are ignored with a warning. */
  register(adapter: FormatAdapter): void {
    const { id } = adapter.capability;
    if (this.adapters.has(id)) {
      console.warn(`Format adapter "${id}" is already registered. Skipping.`);
      return;
    }
    this.adapters.set(id, adapter);
  }

  /** Unregister an adapter by id. */
  unregister(id: string): boolean {
    return this.adapters.delete(id);
  }

  /** Get an adapter by id. */
  get(id: string): FormatAdapter | undefined {
    return this.adapters.get(id);
  }

  /** Get all registered adapters. */
  getAll(): FormatAdapter[] {
    return Array.from(this.adapters.values());
  }

  /** Get adapters filtered by category. */
  getByCategory(category: FormatCategory): FormatAdapter[] {
    return this.getAll().filter((a) => a.capability.category === category);
  }

  /** Get adapters that support a given operation. */
  getByOperation(operation: Operation): FormatAdapter[] {
    return this.getAll().filter((a) => a.capability.operations.includes(operation));
  }

  /** Get all capabilities for UI display. */
  getCapabilities(): FormatCapability[] {
    return this.getAll().map((a) => a.capability);
  }

  /** Check if an adapter is registered. */
  has(id: string): boolean {
    return this.adapters.has(id);
  }

  /** Number of registered adapters. */
  get size(): number {
    return this.adapters.size;
  }
}

/** Singleton registry instance. */
export const registry = new FormatRegistry();
export type { FormatRegistry };

