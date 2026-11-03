import { describe, it, expect, beforeEach } from 'vitest';
import { registry } from './index';
import type { FormatAdapter } from '../types';

function makeAdapter(id: string, overrides?: Partial<FormatAdapter['capability']>): FormatAdapter {
  return {
    capability: {
      id,
      label: id,
      category: 'qr',
      operations: ['generate'],
      support: 'browser',
      ...overrides,
    },
  };
}

describe('FormatRegistry', () => {
  beforeEach(() => {
    // Clear registry between tests
    for (const cap of registry.getCapabilities()) {
      registry.unregister(cap.id);
    }
  });

  it('registers and retrieves an adapter', () => {
    const adapter = makeAdapter('test-qr');
    registry.register(adapter);
    expect(registry.get('test-qr')).toBe(adapter);
    expect(registry.has('test-qr')).toBe(true);
    expect(registry.size).toBe(1);
  });

  it('returns undefined for missing adapters', () => {
    expect(registry.get('nonexistent')).toBeUndefined();
    expect(registry.has('nonexistent')).toBe(false);
  });

  it('does not register duplicates', () => {
    const a1 = makeAdapter('dup');
    const a2 = makeAdapter('dup');
    registry.register(a1);
    registry.register(a2);
    expect(registry.get('dup')).toBe(a1);
    expect(registry.size).toBe(1);
  });

  it('unregisters an adapter', () => {
    registry.register(makeAdapter('to-remove'));
    expect(registry.unregister('to-remove')).toBe(true);
    expect(registry.has('to-remove')).toBe(false);
    expect(registry.unregister('to-remove')).toBe(false);
  });

  it('filters by category', () => {
    registry.register(makeAdapter('qr1', { category: 'qr' }));
    registry.register(makeAdapter('bc1', { category: 'barcode' }));
    registry.register(makeAdapter('qr2', { category: 'qr' }));

    const qrAdapters = registry.getByCategory('qr');
    expect(qrAdapters).toHaveLength(2);
    expect(qrAdapters.map((a) => a.capability.id)).toEqual(['qr1', 'qr2']);
  });

  it('filters by operation', () => {
    registry.register(makeAdapter('gen', { operations: ['generate'] }));
    registry.register(makeAdapter('dec', { operations: ['decode'] }));
    registry.register(makeAdapter('both', { operations: ['generate', 'decode'] }));

    expect(registry.getByOperation('generate')).toHaveLength(2);
    expect(registry.getByOperation('decode')).toHaveLength(2);
    expect(registry.getByOperation('validate')).toHaveLength(0);
  });

  it('returns all capabilities', () => {
    registry.register(makeAdapter('a'));
    registry.register(makeAdapter('b'));
    const caps = registry.getCapabilities();
    expect(caps).toHaveLength(2);
    expect(caps[0]?.id).toBe('a');
    expect(caps[1]?.id).toBe('b');
  });
});

