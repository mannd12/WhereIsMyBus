import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** True when the user has "Reduce Motion" enabled — pause blinking/pulsing UI. */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((r) => {
        if (mounted) setReduce(r);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (r) => setReduce(r));
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduce;
}
