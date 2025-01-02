import { Routes, Route } from 'react-router'
import { type AxiosInstance } from 'axios'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Search from '@/pages/Search'
import About from '@/pages/About'
import Help from '@/pages/Help'
import Statistics from '@/pages/Statistics'
import useColorMode from '@/hooks/useColorMode'

export interface AppProps {
  axios: AxiosInstance
}

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
