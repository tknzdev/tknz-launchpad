import { useLayoutEffect, useEffect } from 'react';

const isClient = typeof window !== 'undefined';

/**
 * A version of `useLayoutEffect` that falls back to `useEffect` on the server.
 * This avoids warnings when server-side rendering while maintaining the behavior
 * of useLayoutEffect when possible.
 */
export const useIsomorphicLayoutEffect = isClient ? useLayoutEffect : useEffect; 