import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Route, Routes, useLocation } from 'react-router'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import useColorMode from '@/hooks/useColorMode'
import { i18n } from '@/i18n'
import About from '@/pages/About'
import Help from '@/pages/Help'
import Search from '@/pages/Search'
import Statistics from '@/pages/Statistics'
import AppStore from '@/stores/app'
import { useLocaleStore } from '@/stores/locale'
import { trackPageView } from '@/utils/matomo'

// --------------------------------------------------------------------------

function App() {
  const appTitleHead = AppStore.getState().appTitleHead

  // initial setup
  console.debug('[App] set color mode and watch for changes ...')
  useColorMode() // TODO: or move to index.tsx?

  // locale changes
  const locale = useLocaleStore((state) => state.locale)
  useEffect(() => {
    i18n.changeLanguage(locale)
  }, [locale])

  if (import.meta.env.FEATURE_TRACKING_MATOMO) {
    /* eslint-disable react-hooks/rules-of-hooks */
    // https://react.dev/reference/rules/rules-of-hooks
    // NOTE: intentional, will be tree-shaken if not enabled on build

    const location = useLocation() // current state
    const [pathname, setPathname] = useState(location.pathname) // previous state
    useEffect(() => {
      const newPathname = location.pathname
      if (newPathname !== pathname) {
        // switched page
        setPathname(newPathname + location.search)
        // console.debug('location', pathname, '=>', newPathname, location)
        trackPageView(newPathname, document.title, pathname) // TODO: maybe referrer pathname should be absolute?
      }
    }, [location, pathname])
  }

  return (
    <>
      <Helmet>
        {/* fallback/reset when not overridden in children (pages) */}
        {/* NOTE: will not "fire" before matomo tracking update, so better to override ourselves explicitely */}
        <title>{appTitleHead}</title>

        {/* TODO: socials ? --> static index.html might be better */}
      </Helmet>
      <Header />
      <main>
        <Routes>
          <Route index element={<Search />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="/stats/:categoryId?" element={<Statistics />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
