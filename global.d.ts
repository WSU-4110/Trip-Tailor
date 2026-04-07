/**
 * Fallback types when node_modules isn't installed. Run `npm install` for full types.
 */
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: Record<string, any>
  }
}

declare module 'next/link' {
  import { ComponentType } from 'react'
  const Link: ComponentType<{ href: string; className?: string; children?: React.ReactNode }>
  export default Link
}

declare module 'next/image' {
  import { ComponentType } from 'react'
  const Image: ComponentType<{
    src: string
    alt: string
    fill?: boolean
    className?: string
    sizes?: string
  }>
  export default Image
}
