import { type AxiosInstance } from 'axios'
import { Route, Routes } from 'react-router'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import useColorMode from '@/hooks/useColorMode'
import About from '@/pages/About'
import Help from '@/pages/Help'
import Search from '@/pages/Search'
import Statistics from '@/pages/Statistics'

// --------------------------------------------------------------------------

export interface AppProps {
  axios: AxiosInstance
}

// --------------------------------------------------------------------------

function App({ axios }: AppProps) {
  // initial setup
  console.debug('[App] set color mode and watch for changes ...')
  useColorMode() // TODO: or move to index.tsx?

  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route index element={<Search axios={axios} />} />
          <Route path="about" element={<About />} />
          <Route path="help" element={<Help />} />
          <Route path="stats" element={<Statistics axios={axios} />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
