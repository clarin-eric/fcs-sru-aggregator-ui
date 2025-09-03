import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import { Helmet } from 'react-helmet-async'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import useKeepSearchParams from '@/hooks/useKeepSearchParams'
import useScript from '@/hooks/useScript'
import AppStore from '@/stores/app'
import { useLocaleStore } from '@/stores/locale'
import { getConfig } from '@/utils/matomo'
import { people, technologiesBackend, technologiesFrontEnd, type Technology } from './data'

import './styles.css'

// --------------------------------------------------------------------------

function About() {
  const { t } = useTranslation()

  const userLocale = useLocaleStore((state) => state.locale)

  const i18nKeyTerms = 'urls.termsUseAndDisclaimer'
  const urlTerms = t(i18nKeyTerms, { ns: 'common' })

  const hasTerms = urlTerms !== i18nKeyTerms
  const hasMatomo = AppStore.getState().matomoTrackingEnabled
  const matomoIndexUrl = getConfig(AppStore.getState().matomoTrackingParams)?.['indexUrl']
  const matomoOptOutScript = matomoIndexUrl
    ? `${matomoIndexUrl}?module=CoreAdminHome&action=optOutJS&language=auto&div=matomo-opt-out`
    : null

  // need to add script like this to work (add a bit of delay in case rending might take a bit)
  useScript(matomoOptOutScript, { delay: 300 })

  const appTitleHead = AppStore.getState().appTitleHead

  const [linkSearch] = useKeepSearchParams()

  const hasApplicationVersionInfo =
    import.meta.env.VITE_GIT_APP_INFO_TAG ||
    import.meta.env.VITE_GIT_APP_INFO_TAG ||
    import.meta.env.VITE_GIT_APP_INFO_REF ||
    import.meta.env.GIT_APP_INFO_DATE

  // whether to show two column info with backend and frontend (or just the frontend)
  const showBackendInfos = hasApplicationVersionInfo

  // ------------------------------------------------------------------------

  function renderTechnologiesList(technologies: readonly Technology[]) {
    return (
      <ul>
        {technologies
          .filter((technology) => technology.hide !== true)
          .map((technology) => (
            <li key={technology.id}>
              {technology.url ? (
                <a href={technology.url}>{technology.name}</a>
              ) : (
                <span>{technology.name}</span>
              )}
              {technology.license && (
                <>
                  {' '}
                  (
                  {technology.licenseUrl ? (
                    <a href={technology.licenseUrl}>{technology.license}</a>
                  ) : (
                    <span>{technology.license}</span>
                  )}
                  )
                </>
              )}
            </li>
          ))}
      </ul>
    )
  }

  function renderDateTime(datetime: string) {
    const date = Date.parse(datetime)
    return Intl.DateTimeFormat(userLocale, { dateStyle: 'medium', timeStyle: 'long' }).format(date)
  }

  // ------------------------------------------------------------------------

  return (
    <>
      <Helmet>
        <title>{appTitleHead} – About</title>
      </Helmet>
      <Container className="py-4">
        <h1 className="h1 mb-4">{t('about.title')}</h1>

        {/* TODO: short intro describing the FCS Aggregator */}

        <div>
          <h2 className="h2">{t('about.people.title')}</h2>
          <p>{t('about.people.developedBy')}</p>
          <ul>
            {people.map((person) => (
              <li key={person}>{person}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="h2">{t('about.statistics.title')}</h2>
          <p>
            <Trans
              i18nKey="about.statistics.text"
              components={[
                <Link to={{ pathname: '/stats', search: linkSearch }}>endpoint statistics</Link>,
              ]}
            />
          </p>
        </div>

        {(hasTerms || hasMatomo) && (
          <div>
            <h2 className="h2">{t('about.privacyPolicy.title')}</h2>
            {hasTerms && (
              <p>
                <Trans
                  i18nKey="about.privacyPolicy.termsInfo"
                  components={[<a href={urlTerms}>clarin.eu</a>]}
                />
              </p>
            )}
            {hasMatomo && (
              <>
                <p>
                  <Trans
                    i18nKey="about.privacyPolicy.matomoInfo"
                    components={[<a href="https://matomo.org/">Matomo</a>]}
                  />
                  {/* TODO: [text] You can explicitely opt-out by using the following form ... */}
                </p>

                {matomoOptOutScript && (
                  <Card className="mb-3" id="matomo-opt-out-container">
                    <Card.Body id="matomo-opt-out" />
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        <div>
          <h2 className="h2">{t('about.sourceCode.title')}</h2>
          <p>
            <Trans
              i18nKey="about.sourceCode.sourceInfo.text"
              components={[
                <a href={t('about.sourceCode.sourceInfo.repoUrl')}>GitHub</a>,
                <a href={t('about.sourceCode.sourceInfo.licenseUrl')}>GPL 3.0 license</a>,
              ]}
            />
          </p>
          <p>{t('about.sourceCode.licenseInfo')}</p>
        </div>

        <div>
          <h2 className="h2">{t('about.versions.title')}</h2>
          <Row>
            {showBackendInfos && hasApplicationVersionInfo && (
              <Col md={12} lg={6}>
                <p>{t('about.versions.backend.text')}</p>
                <dl className="ms-4">
                  <dt>{t('about.versions.backend.lblVersion')}</dt>
                  <dd>
                    <code>{import.meta.env.APPLICATION_VERSION}</code>
                  </dd>
                  {import.meta.env.GIT_APP_INFO_SHA && (
                    <>
                      <dt>{t('about.versions.backend.lblSHA')}</dt>
                      <dd>
                        <code>{import.meta.env.GIT_APP_INFO_SHA}</code>
                      </dd>
                    </>
                  )}
                  {import.meta.env.VITE_GIT_APP_INFO_TAG && (
                    <>
                      <dt>{t('about.versions.backend.lblTag')}</dt>
                      <dd>
                        <code>{import.meta.env.VITE_GIT_APP_INFO_TAG}</code>
                      </dd>
                    </>
                  )}
                  {import.meta.env.VITE_GIT_APP_INFO_REF && (
                    <>
                      <dt>{t('about.versions.backend.lblRef')}</dt>
                      <dd>
                        <code>{import.meta.env.VITE_GIT_APP_INFO_REF}</code>
                      </dd>
                    </>
                  )}
                  {import.meta.env.GIT_APP_INFO_DATE && (
                    <>
                      <dt>{t('about.versions.backend.lblDate')}</dt>
                      <dd>{renderDateTime(import.meta.env.GIT_APP_INFO_DATE)}</dd>
                    </>
                  )}
                </dl>
              </Col>
            )}
            <Col md={12} lg={showBackendInfos && hasApplicationVersionInfo ? 6 : 12}>
              {showBackendInfos && hasApplicationVersionInfo && (
                <p>{t('about.versions.frontend.text')}</p>
              )}
              <dl className={hasApplicationVersionInfo ? 'ms-4' : ''}>
                <dt>{t('about.versions.frontend.lblVersion')}</dt>
                <dd>
                  <code>{import.meta.env.UI_VERSION}</code>
                </dd>
                <dt>{t('about.versions.frontend.lblSHA')}</dt>
                <dd>
                  <code>{import.meta.env.GIT_UI_INFO_SHA}</code>
                </dd>
                {import.meta.env.GIT_UI_INFO_REF &&
                  import.meta.env.GIT_UI_INFO_REF !== import.meta.env.GIT_UI_INFO_SHA && (
                    <>
                      <dt>{t('about.versions.frontend.lblRef')}</dt>
                      <dd>
                        <code>{import.meta.env.GIT_UI_INFO_REF}</code>
                      </dd>
                    </>
                  )}
                <dt>{t('about.versions.frontend.lblDate')}</dt>
                <dd>{renderDateTime(import.meta.env.GIT_UI_INFO_DATE)}</dd>
              </dl>
            </Col>
          </Row>
        </div>

        <div>
          <h2 className="h2">{t('about.technology.title')}</h2>
          <Row>
            {showBackendInfos && (
              <Col md={12} lg={6}>
                <p>{t('about.technology.backendUses')}</p>
                {renderTechnologiesList(technologiesBackend)}
              </Col>
            )}
            <Col md={12} lg={showBackendInfos ? 6 : 12}>
              <p>{t('about.technology.frontendUses')}</p>
              {renderTechnologiesList(technologiesFrontEnd)}
            </Col>
          </Row>
          {/* TODO: [text] fancy FCS logo by ... */}
          <p>
            <Trans
              i18nKey="about.technology.iconLicenseInfo"
              components={[
                <a href="http://www.freepik.com/">Freepik</a>,
                <a href="www.flaticon.com">www.flaticon.com</a>,
                <a href="http://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>,
              ]}
            />
          </p>
        </div>

        {/* <div>
          <h2 className="h2">{t('about.funding.title')}</h2>
        </div> */}
      </Container>
    </>
  )
}

export default About
