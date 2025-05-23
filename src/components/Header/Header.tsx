import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import { Link, NavLink } from 'react-router'
// import { useStore } from 'zustand'

import useKeepSearchParams from '@/hooks/useKeepSearchParams'
import AppStore from '@/stores/app'

import logoUrl from '@images/icon-services-fcs.png'

import personIcon from 'bootstrap-icons/icons/person.svg?raw'

import './styles.css'

// --------------------------------------------------------------------------

function Header() {
  const appTitle = AppStore.getState().appTitle

  // const AppStoreReactive = useStore(AppStore)
  // const authName = AppStoreReactive.authUsername
  const authName = AppStore.getState().authUsername
  const authed = authName !== null && authName !== 'anonymous' // anonymous

  const deployPath = AppStore.getState().deployPath ?? ''
  const loginPath = deployPath + (deployPath.endsWith('/') ? '' : '/') + 'login'

  const linkSearch = useKeepSearchParams()

  // ------------------------------------------------------------------------

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
              alt={`${appTitle} logo`}
            />{' '}
            {appTitle}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="header-navbar-nav" />
          <Navbar.Collapse id="header-navbar-nav">
            <Nav className="w-100 d-flex">
              <Nav.Link as={NavLink} to={{ pathname: '/', search: linkSearch }}>
                Home
              </Nav.Link>
              <Nav.Link as={NavLink} to={{ pathname: '/help', search: linkSearch }}>
                Help
              </Nav.Link>
              {authed ? (
                <Navbar.Text className="ms-auto">
                  <i dangerouslySetInnerHTML={{ __html: personIcon }} /> Signed in as{' '}
                  <span className="fw-bold">{authName}</span>
                </Navbar.Text>
              ) : (
                <Nav.Link href={`${loginPath}${linkSearch ?? ''}`} className="ms-auto">
                  <i dangerouslySetInnerHTML={{ __html: personIcon }} /> Login
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  )
}

export default Header
