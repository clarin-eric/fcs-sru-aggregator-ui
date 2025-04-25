import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import { Link } from 'react-router'

import AppStore from '@/stores/app'

import './styles.css'

// --------------------------------------------------------------------------

function Footer() {
  const termsAndDisclaimerUrl = AppStore.getState().termsAndDisclaimerUrl
  const contactAddress = AppStore.getState().contactAddress

  return (
    <footer className="text-muted">
      <Container>
        <Row>
          <Col className="text-start d-flex flex-sm-row flex-column column-gap-3 row-gap-2">
            {/* On smaller screen, show about link with contact link */}
            <div>
              <Link to="/about" className="hidden-xs">
                About
              </Link>
              {/* Center version on mobile */}
              <div className="version-info text-muted text-center-xs">
                v{import.meta.env.PACKAGE_VERSION}
              </div>
            </div>
            <Link to="/stats">Statistics</Link>
          </Col>
          <Col className="text-center">
            {/* CLARIN logo and copyright (center column on larger screens) */}
            <span className="footer-fineprint">
              Service provided by <a href="https://www.clarin.eu">CLARIN</a>
            </span>
            <span>
              <br />
              Hosted by CLARIN ERIC
            </span>
          </Col>
          <Col className="hidden-xs text-end d-flex flex-sm-row flex-column justify-content-sm-end column-gap-3 row-gap-2">
            {/* Contact link in right column on larger screens */}
            {termsAndDisclaimerUrl && <a href={termsAndDisclaimerUrl}>Terms & Disclaimer</a>}
            {contactAddress && <a href={contactAddress}>Contact</a>}
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
