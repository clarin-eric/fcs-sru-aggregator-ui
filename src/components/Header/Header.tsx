import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router'
// import { useStore } from 'zustand'

import useKeepSearchParams from '@/hooks/useKeepSearchParams'
import AppStore from '@/stores/app'
import { useLocaleStore } from '@/stores/locale'

import logoUrl from '@images/icon-services-fcs.png'

import personIcon from 'bootstrap-icons/icons/person.svg?raw'
import translateIcon from 'bootstrap-icons/icons/translate.svg?raw'

import './styles.css'

// --------------------------------------------------------------------------

function Header() {
  const { t } = useTranslation()

  const locale: string = useLocaleStore((state) => state.locale)
  const locales: string[] = useLocaleStore((state) => state.locales)
  const setLocale: (locale: string) => void = useLocaleStore((state) => state.setLocale)

  // const AppStoreReactive = useStore(AppStore)
  // const authName = AppStoreReactive.authUsername
  const authName = AppStore.getState().authUsername
  const authed = authName !== null && authName !== 'anonymous' // anonymous

  const deployPath = AppStore.getState().deployPath ?? ''
  const loginPath = deployPath + (deployPath.endsWith('/') ? '' : '/') + 'login'

  const linkSearch = useKeepSearchParams()

  const i18nKeyTranslationHelpUrl = 'urls.helpWithTranslations'
  const urlHelpWithTranslations = t(i18nKeyTranslationHelpUrl, { ns: 'common' })
  const hasHelpWithTranslationsUrl = urlHelpWithTranslations !== i18nKeyTranslationHelpUrl

  // ------------------------------------------------------------------------
  // event handlers

  function handleLocaleChangeClick(eventKey: string | null) {
    if (eventKey === null) return

    console.debug('Change locale to:', eventKey, ', from:', locale)
    setLocale(eventKey)
  }

  // ------------------------------------------------------------------------
  // rendering

  function renderAuth() {
    if (authed) {
      return (
        <Navbar.Text className="ms-auto">
          <i dangerouslySetInnerHTML={{ __html: personIcon }} /> Signed in as{' '}
          <span className="fw-bold">{authName}</span>
        </Navbar.Text>
      )
    }

    // unauthorized
    return (
      <Nav.Link href={`${loginPath}${linkSearch ?? ''}`} className="ms-auto">
        <i dangerouslySetInnerHTML={{ __html: personIcon }} /> {t('header.login.login')}
      </Nav.Link>
    )
  }

  function renderLocales() {
    // if only one locale available, then do not show anything...
    if (!locales || locales.length === 1) return null

    const langNames = new Intl.DisplayNames([locale, 'en'], { type: 'language' })

    const currentSelectedLanguage = (
      <>
        <i dangerouslySetInnerHTML={{ __html: translateIcon }} /> {locale.toUpperCase()}{' '}
      </>
    )

    // TODO: update min-width of .dropdown-menu or add language names?
    return (
      <NavDropdown
        title={currentSelectedLanguage}
        align="end"
        className="ms-2"
        onSelect={handleLocaleChangeClick}
      >
        {locales.map((localeOption) => {
          const langNamesLocalized = new Intl.DisplayNames([localeOption, 'en'], {
            type: 'language',
          })
          return (
            <NavDropdown.Item
              key={localeOption}
              disabled={localeOption === locale}
              aria-disabled={localeOption === locale}
              eventKey={localeOption}
              title={t('header.localeOptionTitle', {
                code: localeOption,
                name: langNamesLocalized.of(localeOption),
                // show translated language name in current active language
                context: localeOption !== locale ? 'translated' : null,
                translated: langNames.of(localeOption),
              })}
            >
              {localeOption.toUpperCase()} – {langNamesLocalized.of(localeOption)}
            </NavDropdown.Item>
          )
        })}
        {hasHelpWithTranslationsUrl && (
          <>
            <NavDropdown.Divider />
            <NavDropdown.Item
              className="matomo_link text-wrap"
              target="_blank"
              href={urlHelpWithTranslations}
            >
              {t('header.localeHelpWithTranslations')}
            </NavDropdown.Item>
          </>
        )}
      </NavDropdown>
    )
  }

  // ------------------------------------------------------------------------
  // UI

  return (
    <header>
      <Navbar expand="md" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand as={Link} to={{ pathname: '/', search: linkSearch }}>
            <img
              src={logoUrl}
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt={`${t('header.title')} logo`}
            />{' '}
            {t('header.title')}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="header-navbar-nav" />
          <Navbar.Collapse id="header-navbar-nav">
            <Nav className="w-100 d-flex">
              <Nav.Link as={NavLink} to={{ pathname: '/', search: linkSearch }}>
                {t('header.menu.home')}
              </Nav.Link>
              <Nav.Link as={NavLink} to={{ pathname: '/help', search: linkSearch }}>
                {t('header.menu.help')}
              </Nav.Link>
              {renderAuth()}
              {renderLocales()}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  )
}

export default Header
