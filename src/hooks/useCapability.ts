import { useMemo } from 'react';
import {
  detectCapabilities,
  type CapabilityKey,
  type HardwareCapabilities,
} from '@/core/capabilities';

/** Returns a snapshot of all hardware capabilities. */
export function useCapabilities(): HardwareCapabilities {
  return useMemo(() => detectCapabilities(), []);
}

/** Check whether a single capability is available. */
export function useCapability(key: CapabilityKey): boolean {
  const caps = useCapabilities();
  return caps[key];
}

