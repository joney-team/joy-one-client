import { useHover } from '@mantine/hooks'
import { FC } from 'react'

export interface HoveredProps {
  children: (props: {
    hovered: boolean,
    ref: React.RefObject<any>,
  }) => React.ReactNode,
  disabled?: boolean,
}

export const Hovered: FC<HoveredProps> = (props) => {
  const { hovered, ref } = useHover<any>()

  return props.children({
    hovered: !!props.disabled ? false : hovered,
    ref,
  })
}