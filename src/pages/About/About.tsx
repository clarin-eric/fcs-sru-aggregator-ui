import Container from 'react-bootstrap/Container'
import { Helmet } from 'react-helmet-async'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import useKeepSearchParams from '@/hooks/useKeepSearchParams'
import AppStore from '@/stores/app'
import { people, technologiesBackend, technologiesFrontEnd, type Technology } from './data'

// --------------------------------------------------------------------------

function About() {
  const { t } = useTranslation()

  const i18nKeyTerms = 'urls.termsUseAndDisclaimer'
  const urlTerms = t(i18nKeyTerms, { ns: 'common' })

  const hasTerms = urlTerms !== i18nKeyTerms
  const hasMatomo = AppStore.getState().matomoTrackingEnabled

  const appTitleHead = AppStore.getState().appTitleHead

  const [linkSearch] = useKeepSearchParams()

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
