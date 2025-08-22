import Container from 'react-bootstrap/Container'
import { Helmet } from 'react-helmet-async'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import useKeepSearchParams from '@/hooks/useKeepSearchParams'
import AppStore from '@/stores/app'
import { useLocaleStore } from '@/stores/locale'
import { people, technologiesBackend, technologiesFrontEnd, type Technology } from './data'

// --------------------------------------------------------------------------

function About() {
  const { t } = useTranslation()

  const userLocale = useLocaleStore((state) => state.locale)

  const i18nKeyTerms = 'urls.termsUseAndDisclaimer'
  const urlTerms = t(i18nKeyTerms, { ns: 'common' })

  const hasTerms = urlTerms !== i18nKeyTerms
  const hasMatomo = AppStore.getState().matomoTrackingEnabled

  const appTitleHead = AppStore.getState().appTitleHead

  const [linkSearch] = useKeepSearchParams()

  const hasApplicationVersionInfo =
    import.meta.env.VITE_GIT_APP_INFO_TAG ||
    import.meta.env.VITE_GIT_APP_INFO_TAG ||
    import.meta.env.VITE_GIT_APP_INFO_REF ||
    import.meta.env.GIT_APP_INFO_DATE

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
              <p>
                <Trans
                  i18nKey="about.privacyPolicy.matomoInfo"
                  components={[<a href="https://matomo.org/">Matomo</a>]}
                />
                {/* TODO: [text] You can explicitely opt-out by using the following form ... */}
              </p>
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
          {hasApplicationVersionInfo && (
            <>
              <p>{t('about.versions.backend.text')}</p>
              <dl className="ms-4">
                <dt>{t('about.versions.backend.lblVersion')}</dt>
                <dd>{import.meta.env.APPLICATION_VERSION}</dd>
                {import.meta.env.GIT_APP_INFO_SHA && (
                  <>
                    <dt>{t('about.versions.backend.lblSHA')}</dt>
                    <dd>{import.meta.env.GIT_APP_INFO_SHA}</dd>
                  </>
                )}
                {import.meta.env.VITE_GIT_APP_INFO_TAG && (
                  <>
                    <dt>{t('about.versions.backend.lblTag')}</dt>
                    <dd>{import.meta.env.VITE_GIT_APP_INFO_TAG}</dd>
                  </>
                )}
                {import.meta.env.VITE_GIT_APP_INFO_REF && (
                  <>
                    <dt>{t('about.versions.backend.lblRef')}</dt>
                    <dd>{import.meta.env.VITE_GIT_APP_INFO_REF}</dd>
                  </>
                )}
                {import.meta.env.GIT_APP_INFO_DATE && (
                  <>
                    <dt>{t('about.versions.backend.lblDate')}</dt>
                    <dd>{renderDateTime(import.meta.env.GIT_APP_INFO_DATE)}</dd>
                  </>
                )}
              </dl>
            </>
          )}
          {hasApplicationVersionInfo && <p>{t('about.versions.frontend.text')}</p>}
          <dl className={hasApplicationVersionInfo ? 'ms-4' : ''}>
            <dt>{t('about.versions.frontend.lblVersion')}</dt>
            <dd>{import.meta.env.UI_VERSION}</dd>
            <dt>{t('about.versions.frontend.lblSHA')}</dt>
            <dd>{import.meta.env.GIT_UI_INFO_SHA}</dd>
            <dt>{t('about.versions.frontend.lblRef')}</dt>
            <dd>{import.meta.env.GIT_UI_INFO_REF}</dd>
            <dt>{t('about.versions.frontend.lblDate')}</dt>
            <dd>{renderDateTime(import.meta.env.GIT_UI_INFO_DATE)}</dd>
          </dl>
        </div>

        <div>
          <h2 className="h2">{t('about.technology.title')}</h2>
          <p>{t('about.technology.backendUses')}</p>
          {renderTechnologiesList(technologiesBackend)}
          <p>{t('about.technology.frontendUses')}</p>
          {renderTechnologiesList(technologiesFrontEnd)}
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
