import Container from 'react-bootstrap/Container'
import { Helmet } from 'react-helmet-async'
import { Trans, useTranslation } from 'react-i18next'

import AppStore from '@/stores/app'

import eyeIcon from 'bootstrap-icons/icons/eye.svg?raw'
import magicIcon from 'bootstrap-icons/icons/magic.svg?raw'

function Help() {
  const { t } = useTranslation()
  const appTitleHead = AppStore.getState().appTitleHead

  return (
    <>
      <Helmet>
        <title>{appTitleHead} – Help</title>
      </Helmet>
      <Container className="my-4">
        <h1 className="h1">{t('help.title')}</h1>
        <h2 className="h2" id="performing-a-fcs-search-in-resources">
          {t('help.performSearch.title')}
        </h2>
        <p>
          <Trans i18nKey="help.performSearch.textBasicSearch" />
        </p>
        <p>
          <Trans
            i18nKey="help.performSearch.textAdvancedSearch"
            components={{
              iconMagicWand: (
                <i dangerouslySetInnerHTML={{ __html: magicIcon }} aria-hidden="true" />
              ),
            }}
          />
        </p>
        <p>
          <Trans
            i18nKey="help.performSearch.textLexicalSearch"
            components={{
              iconMagicWand: (
                <i dangerouslySetInnerHTML={{ __html: magicIcon }} aria-hidden="true" />
              ),
            }}
          />
        </p>
        <p>
          <Trans i18nKey="help.performSearch.textSearchProgress" />
        </p>
        <p>
          <Trans
            i18nKey="help.performSearch.textViewResource"
            components={{
              iconEye: <i dangerouslySetInnerHTML={{ __html: eyeIcon }} aria-hidden="true" />,
            }}
          />
        </p>
        <h2 className="h2" id="adjusting-search-criteria">
          {t('help.adjustSearchCriteria.title')}
        </h2>
        <p>
          <Trans i18nKey="help.adjustSearchCriteria.text" />
        </p>
        <p>
          <Trans i18nKey="help.adjustSearchCriteria.textOtherSearchTypes" />
        </p>
        <h2 className="h2" id="more-help">
          {t('help.moreHelp.title')}
        </h2>
        <p>
          <Trans
            i18nKey="help.moreHelp.text"
            components={[
              <a href="https://www.clarin.eu/content/content-search-tutorial">
                Content Search: Tutorial at CLARIN.eu
              </a>,
              <a title="contact" href={t('urls.contact', { ns: 'common' })}>
                CLARIN FCS Helpdesk
              </a>,
            ]}
          />
        </p>
      </Container>
    </>
  )
}

export default Help
