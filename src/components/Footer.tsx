import { Link } from 'react-router'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'

import './Footer.css'

function Footer() {
  return (
    <footer className="text-muted">
      <Container>
        <Row>
          <Col className="text-start">
            {/* On smaller screen, show about link with contact link */}
            <Link to="/about" className="hidden-xs">
              About
            </Link>
            {/* Center version on mobile */}
            <div className="version-info text-muted text-center-xs">
              v{import.meta.env.PACKAGE_VERSION}
            </div>
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
          <Col className="hidden-xs text-end">
            {/* Contact link in right column on larger screens */}
            <a href={import.meta.env.CONTACT_ADDRESS}>Contact</a>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
