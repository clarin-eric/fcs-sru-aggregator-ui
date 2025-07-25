import { ReactNode } from 'react'

// --------------------------------------------------------------------------
// types

export interface ToastMessage {
  title: ReactNode
  body: ReactNode
  variant?:
    | 'info'
    | 'success'
    | 'warning'
    | 'danger'
    | 'primary'
    | 'secondary'
    | 'light'
    | 'dark'
    | string
  delay?: number
}

// --------------------------------------------------------------------------
