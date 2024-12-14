import { Routes, Route } from 'react-router'
import Header from '@/components/header'
import Footer from '@/components/footer'
import Search from '@/pages/search'
import About from '@/pages/about'
import Help from '@/pages/help'
import Statistics from '@/pages/statistics'
import { useColorMode } from '@/utils/bs-color-mode'
import { type AxiosInstance } from 'axios'

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
