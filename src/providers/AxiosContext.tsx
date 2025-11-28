import type { AxiosInstance } from 'axios'
import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'

// --------------------------------------------------------------------------

const AxiosContext = createContext<AxiosInstance | undefined>(undefined)
AxiosContext.displayName = 'AxiosContext'

// --------------------------------------------------------------------------

function useAxios() {
  const axios = useContext(AxiosContext)

  if (!axios) throw new Error('No "axios" instance set, use AxiosProvider to set one')

  return axios
}

// --------------------------------------------------------------------------

interface AxiosProviderProps {
  axios: AxiosInstance
  children?: ReactNode
}

function AxiosProvider({ axios, children }: AxiosProviderProps) {
  return <AxiosContext.Provider value={axios}>{children}</AxiosContext.Provider>
}

// --------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export { AxiosContext, AxiosProvider, useAxios }
