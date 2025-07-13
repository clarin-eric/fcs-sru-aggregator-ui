import Container from 'react-bootstrap/Container'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

import AppStore from '@/stores/app'

function Help() {
  const { t } = useTranslation()
  const appTitleHead = AppStore.getState().appTitleHead

  return (
    <>
      <Helmet>
        <title>{appTitleHead} – Help</title>
      </Helmet>
      <Container>
        <h1 className="h1">Help</h1>
        <h2 className="h2">Performing a Federated Content Search in resources</h2>
        <p></p>
        <h2 className="h2">Adjusting search criteria</h2>
        <p></p>
        <h2>More help</h2>
        <p>
          More detailed information on using FCS Aggregator is available at the{' '}
          <a href="https://www.clarin.eu/content/content-search-tutorial">
            Content Search: Tutorial at CLARIN.eu
          </a>
          . If you still cannot find an answer to your question, or if want to send a feedback, you
          can write to the{' '}
          <a title="contact" href={t('urls.contact', { ns: 'common' })}>
            CLARIN FCS Helpdesk
          </a>
          .
        </p>
      </Container>
    </>
  )
}

export default Help
