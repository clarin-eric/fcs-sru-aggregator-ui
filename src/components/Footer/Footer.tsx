import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import useKeepSearchParams from '@/hooks/useKeepSearchParams'

import './styles.css'

// --------------------------------------------------------------------------

function Footer() {
  const { t } = useTranslation()

  const i18nKeyTerms = 'urls.termsUseAndDisclaimer'
  const urlTerms = t(i18nKeyTerms, { ns: 'common' })
  const hasTerms = urlTerms !== i18nKeyTerms
  const i18nKeyContact = 'urls.contact'
  const urlContact = t(i18nKeyContact, { ns: 'common' })
  const hasContact = urlContact !== i18nKeyContact
  const i18nKeyServiceInfo = 'footer.serviceInfo.text'
  const transServiceInfo = t(i18nKeyServiceInfo)
  const hasServiceInfo = transServiceInfo !== i18nKeyServiceInfo

  const [linkSearch] = useKeepSearchParams()

  // ------------------------------------------------------------------------

  return (
    <footer className="text-muted">
      <Container>
        <Row>
          <Col className="text-start d-flex flex-sm-row flex-column column-gap-3 row-gap-2">
            {/* On smaller screen, show about link with contact link */}
            <div>
              <Link to={{ pathname: '/about', search: linkSearch }} className="hidden-xs">
                {t('footer.links.about')}
              </Link>
              {/* Center version on mobile */}
              <div className="version-info text-muted text-center-xs">
                v{import.meta.env.APPLICATION_VERSION}
              </div>
            </div>
            <Link to={{ pathname: '/stats', search: linkSearch }}>
              {t('footer.links.statistics')}
            </Link>
          </Col>
          <Col className="text-center">
            {/* CLARIN logo and copyright (center column on larger screens) */}
            {hasServiceInfo && (
              <Trans
                i18nKey={i18nKeyServiceInfo}
                components={{
                  serviceBy: <a href={t('footer.serviceInfo.urlServiceBy')} />,
                  hostedBy: <a href={t('footer.serviceInfo.urlHostedBy')} />,
                }}
              />
            )}
          </Col>
          <Col className="hidden-xs text-end d-flex flex-sm-row flex-column justify-content-sm-end column-gap-3 row-gap-2">
            {/* Contact link in right column on larger screens */}
            {hasTerms && <a href={urlTerms}>{t('footer.links.termsUseAndDisclaimer')}</a>}
            {hasContact && <a href={urlContact}>{t('footer.links.contact')}</a>}
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
