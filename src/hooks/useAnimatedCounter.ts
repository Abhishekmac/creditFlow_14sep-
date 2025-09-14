import { useEffect, useState } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

export function useAnimatedCounter(value: number, duration: number = 600) {
  const [displayValue, setDisplayValue] = useState(value);
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, {
    duration: duration,
    bounce: 0,
  });

  const rounded = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    motionValue.set(value);
    const unsubscribe = rounded.onChange(setDisplayValue);
    return () => unsubscribe();
  }, [value, motionValue, rounded]);

  return displayValue;
}