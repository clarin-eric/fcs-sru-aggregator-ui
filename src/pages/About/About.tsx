import Container from 'react-bootstrap/Container'
import { Helmet } from 'react-helmet-async'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import useKeepSearchParams from '@/hooks/useKeepSearchParams'
import AppStore from '@/stores/app'

// --------------------------------------------------------------------------

interface Technology {
  id: string
  name: string
  url?: string
  license?: string
  licenseUrl?: string
  usage?: string
  hide?: boolean
}

// TODO: add affiliations?
const people = [
  'Emanuel Dima',
  'Erik Körner',
  'Leif-Jöran Olsson',
  'Yana Panchenko',
  'Oliver Schonefeld',
  'Dieter Van Uytvanck',
]

const technologiesBackend: readonly Technology[] = [
  {
    id: 'dropwizard',
    name: 'Dropwizard',
    url: 'https://www.dropwizard.io/',
    license: 'Apache License 2.0',
    licenseUrl: 'https://github.com/dropwizard/dropwizard/blob/release/3.0.x/LICENSE',
    usage: 'web server',
  },
  {
    id: 'de.mpg.mpgaai:mpgaai-shhaa',
    name: 'MPG-AAI - simple http header authn/z',
    url: 'https://github.com/clarin-eric/mpgaai', // TODO: ...
    license: 'Apache License 2.0',
    licenseUrl: 'http://www.apache.org/licenses/LICENSE-2.0.txt',
    usage: 'AAI / Shibboleth support',
  },
  {
    id: 'io.swagger.core.v3',
    name: 'Swagger Core',
    url: 'https://github.com/swagger-api/swagger-core',
    license: 'Apache License 2.0',
    licenseUrl: 'https://github.com/swagger-api/swagger-core/blob/master/LICENSE',
    usage: 'REST API documentation',
  },
  {
    id: 'org.glassfish.jersey',
    name: 'Eclipse Jersey',
    url: 'https://eclipse-ee4j.github.io/jersey/',
    license: 'Eclipse Public License 2.0',
    licenseUrl: 'https://github.com/eclipse-ee4j/jersey/blob/2.x/LICENSE.md',
    usage: 'RESTful web services',
  },
  {
    id: 'org.slf4j',
    name: 'Simple Logging Facade for Java (SLF4J)',
    url: 'https://www.slf4j.org/',
    license: 'MIT License',
    licenseUrl: 'https://www.slf4j.org/license.html',
    usage: 'logging',
  },
  {
    id: 'org.junit',
    name: 'JUnit 5',
    url: 'https://junit.org/',
    license: 'Eclipse Public License 2.0',
    licenseUrl: 'https://github.com/junit-team/junit-framework/blob/main/LICENSE.md',
    usage: 'testing',
  },
  {
    id: 'optimaize/language-detector',
    name: 'Optimaize Language Detector',
    url: 'https://github.com/optimaize/language-detector',
    license: 'Apache License 2.0',
    licenseUrl: 'https://github.com/optimaize/language-detector/blob/master/LICENSE',
    usage: 'language detection of results',
  },
  {
    id: 'org.apache.commons:commons-text',
    name: 'Apache Commons Text',
    url: 'https://commons.apache.org/proper/commons-text/',
    license: 'Apache License 2.0',
    licenseUrl: 'https://github.com/apache/commons-text/blob/master/LICENSE.txt',
    usage: 'export format',
  },
  {
    id: 'com.sun.xml.bind',
    name: 'JAXB Reference Implementation',
    url: 'https://eclipse-ee4j.github.io/jaxb-ri/',
    license: 'Common Development and Distribution License (CCDL) 1.1',
    licenseUrl: 'https://github.com/javaee/jaxb-v2/blob/2.3.0.1/jaxb-ri/License.txt',
    usage: 'XML support',
    hide: true,
  },
  {
    id: 'eu.clarin.weblicht:wlfxb',
    name: 'Weblicht wlfxb',
    url: 'https://weblicht.sfs.uni-tuebingen.de',
    license: 'GNU Lesser General Public License v3.0',
    licenseUrl: 'https://github.com/weblicht/wlfxb/blob/master/LICENSE.txt',
    usage: 'export format',
  },
  {
    id: 'org.apache.poi:poi-ooxml',
    name: 'Apache POI', // API Based On OPC and OOXML Schemas
    url: 'https://poi.apache.org/',
    license: 'Apache License 2.0',
    licenseUrl: 'https://github.com/apache/poi/blob/trunk/legal/LICENSE',
    usage: 'export format',
  },
  {
    id: 'org.jopendocument:jOpenDocument',
    name: 'jOpenDocument',
    url: 'https://www.jopendocument.org/',
    license: 'GNU Lesser General Public License v3.0',
    licenseUrl: 'https://www.jopendocument.org/support.html',
    usage: 'export format',
  },
  {
    id: 'eu.clarin.sru:sru-client',
    name: 'CLARIN SRU/CQL Client',
    license: 'GNU General Public License v3.0',
    licenseUrl: 'https://github.com/clarin-eric/fcs-sru-client/blob/main/LICENSE.txt',
    usage: 'SRU / CQL client framework',
    hide: true,
  },
  {
    id: 'eu.clarin.sru.fcs:fcs-simple-client',
    name: 'CLARIN-FCS Client',
    license: 'GNU General Public License v3.0',
    licenseUrl: 'https://github.com/clarin-eric/fcs-simple-client/blob/main/LICENSE.txt',
    usage: 'FCS client framework',
    hide: true,
  },
]

const technologiesFrontEnd: readonly Technology[] = [
  {
    id: 'react',
    name: 'React',
    url: 'https://react.dev/',
    license: 'MIT License',
    licenseUrl: 'https://github.com/facebook/react/blob/main/LICENSE',
  },
  {
    id: 'react-dom',
    name: 'ReactDOM',
    url: 'https://react.dev/reference/react-dom',
    license: 'MIT License',
    licenseUrl: 'https://github.com/facebook/react/blob/main/LICENSE',
    hide: true,
  },
  {
    id: 'react-router',
    name: 'React Router',
    url: 'https://reactrouter.com/',
    license: 'MIT License',
    licenseUrl: 'https://github.com/remix-run/react-router/blob/main/LICENSE.md',
    usage: 'single page application routing',
  },
  {
    id: 'react-bootstrap',
    name: 'React Bootstrap',
    url: 'https://react-bootstrap.netlify.app/',
    license: 'MIT License',
    licenseUrl: 'https://github.com/react-bootstrap/react-bootstrap/blob/master/LICENSE',
    usage: 'react bindings for bootstrap',
  },
  {
    id: 'bootstrap',
    name: 'Bootstrap',
    url: 'https://getbootstrap.com/',
    license: 'MIT License',
    licenseUrl: 'https://github.com/twbs/bootstrap/blob/main/LICENSE',
    usage: 'UI framework',
  },
  {
    id: 'bootstrap-icons',
    name: 'Bootstrap Icons',
    url: 'https://icons.getbootstrap.com/',
    license: 'MIT License',
    licenseUrl: 'https://github.com/twbs/icons/blob/main/LICENSE',
  },
  {
    id: '@tanstack/react-query',
    name: 'TanStack Query',
    url: 'https://tanstack.com/query',
    license: 'MIT License',
    licenseUrl: 'https://github.com/TanStack/query/blob/main/LICENSE',
    usage: 'data loading via REST APIs',
  },
  {
    id: 'axios',
    name: 'Axios',
    url: 'https://axios-http.com/',
    license: 'MIT License',
    licenseUrl: 'https://github.com/axios/axios/blob/v1.x/LICENSE',
    usage: 'cross-browser support for REST API requests',
  },
  {
    id: 'antlr4ng',
    name: 'Next Generation TypeScript runtime for ANTLR4',
    url: 'https://github.com/mike-lischke/antlr4ng',
    license: 'The "BSD license"',
    licenseUrl: 'https://github.com/mike-lischke/antlr4ng/blob/main/LICENSE.txt',
    usage: 'query parser',
  },
  {
    id: 'i18next',
    name: 'i18next',
    url: 'https://www.i18next.com/',
    license: 'MIT License',
    licenseUrl: 'https://github.com/i18next/i18next/blob/master/LICENSE',
    usage: 'translations',
  },
  {
    id: 'react-i18next',
    name: 'react-i18next',
    url: 'https://react.i18next.com/',
    license: 'MIT License',
    licenseUrl: 'https://github.com/i18next/react-i18next/blob/master/LICENSE',
    usage: 'translations',
    hide: true,
  },
  {
    id: 'i18next-resources-to-backend',
    name: 'i18next-resources-to-backend',
    url: 'https://github.com/i18next/i18next-resources-to-backend',
    license: 'MIT License',
    licenseUrl: 'https://github.com/i18next/i18next-resources-to-backend/blob/main/licence',
    usage: 'translation resource loading',
    hide: true,
  },
  {
    id: 'zustand',
    name: 'Zustand',
    url: 'https://zustand-demo.pmnd.rs/',
    license: 'MIT License',
    licenseUrl: 'https://github.com/pmndrs/zustand/blob/main/LICENSE',
    usage: 'state management',
  },
  {
    id: '@nozbe/microfuzz',
    name: 'microfuzz',
    url: 'https://github.com/Nozbe/microfuzz',
    license: 'MIT License',
    licenseUrl: 'https://github.com/Nozbe/microfuzz/blob/main/LICENSE',
    usage: 'fuzzy search',
  },
  {
    id: 'react-helmet-async',
    name: 'React Helmet (async fork)',
    url: 'https://github.com/staylor/react-helmet-async',
    license: 'Apache License 2.0',
    licenseUrl: 'https://github.com/staylor/react-helmet-async/blob/main/LICENSE',
    usage: 'HTML head modifications',
  },
  {
    id: 'react-slugify',
    name: 'react-slugify',
    url: 'https://github.com/martpie/react-slugify',
    license: 'MIT License',
    licenseUrl: 'https://github.com/martpie/react-slugify/blob/master/LICENSE',
    usage: 'jump id fragment generation',
  },
]

function About() {
  const { t } = useTranslation()

  const i18nKeyTerms = 'urls.termsUseAndDisclaimer'
  const urlTerms = t(i18nKeyTerms, { ns: 'common' })

  const hasTerms = urlTerms !== i18nKeyTerms
  const hasMatomo = AppStore.getState().matomoTrackingEnabled

  const appTitleHead = AppStore.getState().appTitleHead

  const linkSearch = useKeepSearchParams()

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
