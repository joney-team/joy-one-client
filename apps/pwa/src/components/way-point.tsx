import { Box } from '@mantine/core';
import { useThrottledCallback } from '@mantine/hooks';
import { FC, useEffect, useRef } from 'react';

interface WayPointProps {
  onReached?: () => void;
  throttle?: number;
  enabled?: boolean;
  scrollContainerId?: string;
  scrollContainerRef?: HTMLElement;
  offset?: number;
}

export const WayPoint: FC<WayPointProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = typeof props.enabled === 'boolean' ? props.enabled : true;
  const offset = typeof props.offset === 'number' ? props.offset : 0;
  const throttle = typeof props.throttle === 'number' ? props.throttle : 1000;

  const onReached = useThrottledCallback(() => {
    props.onReached?.();
  }, throttle);

  useEffect(() => {
    if (enabled) {
      setTimeout(() => {
        const scrollContainer = props.scrollContainerRef ? props.scrollContainerRef : props.scrollContainerId ? document.getElementById(props.scrollContainerId) || window : window;

        const handleScroll = () => {
          const innerHeight = scrollContainer instanceof Window ? window.innerHeight : (scrollContainer as HTMLElement).clientHeight;

          // Detect when element visible on screen
          const rect = ref.current?.getBoundingClientRect();
          if (rect && rect.top < innerHeight + offset) {
            onReached?.();
          }
        }

        scrollContainer.addEventListener('scroll', handleScroll);

        return () => {
          scrollContainer.removeEventListener('scroll', handleScroll);
        }
      }, 300);
    }
  }, [enabled, props.scrollContainerRef, props.scrollContainerId])

  if (!enabled) return null;

  return (
    <Box ref={ref} w="100%" h={0} />
  )
}