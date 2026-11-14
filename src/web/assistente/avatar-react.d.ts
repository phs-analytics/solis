// The package's .d.ts uses extensionless relative imports, which NodeNext can't follow.
// shortcut: hand-copied subset of its props; drop this file (and the tsconfig path) once upstream fixes it.
import type { CSSProperties, ReactElement } from 'react';

export interface CreatedAvatarProps {
  state?: string;
  clip?: string;
  face?: string;
  paused?: boolean;
  lookAt?: [number, number] | null;
  followPointer?: boolean;
  emphasis?: boolean;
  muted?: boolean;
  settleAfterMs?: number;
  seed?: number;
  size?: number | string;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  onStateChange?: (state: string | null) => void;
}

export declare const createAvatar: (file: unknown) => (props: CreatedAvatarProps) => ReactElement;
