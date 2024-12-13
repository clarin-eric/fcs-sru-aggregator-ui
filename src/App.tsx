import { useEffect } from 'react'
import { Routes, Route } from 'react-router'
import Header from '@/components/header'
import Footer from '@/components/footer'
import Search from '@/pages/search'
import About from '@/pages/about'
import Help from '@/pages/help'
import Statistics from '@/pages/statistics'
import setAndWatchColorMode from '@/utils/bs-color-mode'

import '@/App.css'

// https://vite.dev
// https://react.dev

function App() {
  // initial setup
  useEffect(() => {
    console.debug('[App] set color mode and watch for changes ...')
    setAndWatchColorMode()
  }, [])

  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route index element={<Search />} />
          <Route path="about" element={<About />} />
          <Route path="help" element={<Help />} />
          <Route path="stats" element={<Statistics />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
