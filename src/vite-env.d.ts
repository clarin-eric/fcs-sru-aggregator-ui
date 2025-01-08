/// <reference types="vite/client" />

declare module 'prismjs/components/prism-core' {
  export * from '@types/prismjs'
}

// support of setting variables in react style attribute
// see: https://stackoverflow.com/a/70398145/9360161
declare namespace React {
  interface CSSProperties {
    [key: `--${string}`]: string | number
  }
}
