import { useMutation, useQuery } from '@tanstack/react-query'
import { ReactNode, useEffect, useState } from 'react'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Spinner from 'react-bootstrap/Spinner'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import { Helmet } from 'react-helmet'
import { useSearchParams } from 'react-router'

import { AggregatorDataProvider } from '@/providers/AggregatorDataContext'
import { useAxios } from '@/providers/AxiosContext'
import { SearchParamsProvider } from '@/providers/SearchParamsContext'
import { getInitData, postSearch, type Resource } from '@/utils/api'
import { trackSiteSearch } from '@/utils/matomo'
import { evaluateAggregationContext, fromApi, getResourceIDs } from '@/utils/resources'
import { type LanguageCode2NameMap } from '@/utils/search'
import SearchInput, { type SearchData } from './SearchInput'
import SearchResults from './SearchResults'

import fcsLogoDarkModeUrl from '@images/logo-fcs-dark.png'
import fcsLogoUrl from '@images/logo-fcs.png'

import './styles.css'

// --------------------------------------------------------------------------
// types

interface ToastMessage {
  title: ReactNode
  body: ReactNode
  variant?:
    | 'info'
    | 'success'
    | 'warning'
    | 'danger'
    | 'primary'
    | 'secondary'
    | 'light'
    | 'dark'
    | string
}

// --------------------------------------------------------------------------
// component

function Search() {
  const axios = useAxios()

  const [urlSearchParams, setUrlSearchParams] = useSearchParams()

  // REST API state
  const [resources, setResources] = useState<Resource[]>([])
  const [languages, setLanguages] = useState<LanguageCode2NameMap>({})
  const [weblichtLanguages, setWeblichtLanguages] = useState<string[]>([])

  const [searchResourceIDs, setSearchResourceIDs] = useState<string[] | null>(null)

  const [hasSearch, setHasSearch] = useState(false)
  const [searchParams, setSearchParams] = useState<SearchData | null>(null)

  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // ------------------------------------------------------------------------
  // initialization

  const { data, isLoading, isError } = useQuery({
    queryKey: ['init'],
    queryFn: getInitData.bind(null, axios),
  })

  useEffect(() => {
    if (!data) return

    // do some initialization (based on `data`)
    const newResources = fromApi(data.resources)

    // set state
    setLanguages(data.languages)
    setWeblichtLanguages(data.weblichtLanguages)
    setResources(newResources)

    // initialization (hack) to select all resources
    setSearchResourceIDs(getResourceIDs(newResources))
  }, [data])

  useEffect(() => {
    console.debug('searchParams', urlSearchParams)
    if (!resources || resources.length === 0) return

    const aggregationContext = urlSearchParams.get('x-aggregation-context')
    if (aggregationContext) {
      try {
        const endpoints2handles = JSON.parse(aggregationContext)

        // TODO: evaluate if correct and what format
        // TODO: support easier resource IDs list format

        const { selected, unavailable } = evaluateAggregationContext(resources, endpoints2handles)
        console.debug('aggregationContext', {
          aggregationContext,
          resources,
          endpoints2handles,
          evaluated: { selected, unavailable },
        })
        if (selected.length > 0) {
          setSearchResourceIDs(selected)

          setToasts((toasts) => [
            ...toasts,
            {
              title: 'Resource Selection',
              body: (
                <>
                  Preselected <strong>{selected.length}</strong> resources:
                  <br />
                  <ul className="ps-3">
                    {selected.map((rid) => (
                      <li style={{ wordBreak: 'break-all', fontSize: '0.7rem' }}>{rid}</li>
                    ))}
                  </ul>
                </>
              ),
              variant: 'success',
            },
          ])
        }
        if (unavailable.length > 0) {
          setToasts((toasts) => [
            ...toasts,
            {
              title: 'Resource Selection',
              body: (
                <>
                  Unable to select <strong>{unavailable.length}</strong> resources:
                  <br />
                  <ul className="ps-3">
                    {unavailable.map((rid) => (
                      <li style={{ wordBreak: 'break-all', fontSize: '0.7rem' }}>{rid}</li>
                    ))}
                  </ul>
                </>
              ),
              variant: 'warning',
            },
          ])
        }
      } catch (error) {
        console.error(
          'Error trying to parse "x-aggregation-context" search parameter!',
          {
            aggregationContext,
          },
          error
        )
        if (error instanceof Error) {
          setToasts((toasts) => [
            ...toasts,
            {
              title: 'Resource Selection',
              body: (
                <>
                  Unable to preselect resources: {error.name}
                  <br />
                  <small>{error.message}</small>
                </>
              ),
              variant: 'error',
            },
          ])
        }
      }
      // remove after use, will trigger next evaluation of URLSearchParams ...
      setUrlSearchParams((params) => (params.delete('x-aggregation-context'), params))
    }
  }, [resources, urlSearchParams, setUrlSearchParams])

  // ------------------------------------------------------------------------

  // on state update, this component is re-evaluated which re-evaluates the expressions below, too
  const isInputDisabled = isLoading || isError
  // console.debug('isInputDisabled', isInputDisabled, 'isLoading', isLoading, 'isError', isError)

  // ------------------------------------------------------------------------
  // search request

  // the actual search
  const {
    mutate: mutateSearch,
    data: searchId,
    error: searchError,
    isPending: isSearchPending,
    isError: isSearchError,
  } = useMutation({
    mutationKey: ['search'],
    mutationFn: ({ query, queryType, language, numberOfResults, resourceIDs }: SearchData) =>
      postSearch(axios, {
        query,
        queryType,
        language,
        numberOfResults: numberOfResults.toString(),
        resourceIds: resourceIDs,
      }),
  })
  console.debug('searchId', { searchId, searchError, isSearchPending, isSearchError })

  // ------------------------------------------------------------------------
  // event handlers

  function handleSearch(searchData: SearchData) {
    console.debug('start search:', searchData)

    setSearchResourceIDs(searchData.resourceIDs)

    setSearchParams(searchData)
    setHasSearch(true)

    if (import.meta.env.FEATURE_TRACKING_MATOMO) {
      trackSiteSearch(searchData.query, searchData.queryType)
    }

    mutateSearch(searchData)
  }

  // ------------------------------------------------------------------------
  // utilities

  // ------------------------------------------------------------------------
  // UI

  return (
    <>
      <Helmet>
        <title>{import.meta.env.HEAD_TITLE}</title>
      </Helmet>
      <Container id="search">
        {/* toasters */}
        <div aria-live="polite" aria-atomic="true" className="bg-dark position-relative">
          {/* TODO: animate? */}
          <ToastContainer position="top-end" className="mt-2" style={{ zIndex: 100 }}>
            {toasts.map((toast, index) => (
              <Toast
                bg={toast.variant}
                key={index}
                // show={toasts.find((oldToast) => oldToast === toast) !== undefined}
                onClose={() =>
                  setToasts((toasts) => toasts.filter((oldToast) => oldToast !== toast))
                }
                delay={5000}
                autohide
              >
                <Toast.Header closeButton={true}>
                  <strong className="me-auto">{toast.title}</strong>
                </Toast.Header>
                <Toast.Body>{toast.body}</Toast.Body>
              </Toast>
            ))}
          </ToastContainer>
        </div>

        {/* logo image */}
        {!hasSearch && (
          <Row>
            <Col className="text-center">
              <picture>
                <source srcSet={fcsLogoUrl} media="(prefers-color-scheme: light)" />
                <source srcSet={fcsLogoDarkModeUrl} media="(prefers-color-scheme: dark)" />
                <img src={fcsLogoUrl} className="logo" alt="FCS logo" />
              </picture>
            </Col>
          </Row>
        )}

        {/* search input */}
        <Row className="mt-3">
          <Col>
            <SearchInput
              resources={resources}
              languages={languages}
              availableResources={null}
              selectedResources={searchResourceIDs}
              onSearch={handleSearch}
              hasSearch={hasSearch}
              disabled={isInputDisabled}
            />
          </Col>
        </Row>

        {/* short intro text on initial visit/site load */}
        {!hasSearch && (
          <Row className="mt-3">
            <Col>
              <p>
                To enable researchers to search for specific patterns across collections of data,
                CLARIN offers a search engine that connects to the local data collections that are
                available in the centres. The data itself stays at the centre where it is hosted –
                which is why the underlying technique is called <em>federated content search</em>.
              </p>
              <p>TODO: some more brief intro text and maybe links for further information ...</p>
            </Col>
          </Row>
        )}

        {hasSearch && isSearchPending && (
          <Row>
            <Col className="text-center my-5">
              <Spinner animation="border" />
            </Col>
          </Row>
        )}
        {searchParams && searchId && (
          <AggregatorDataProvider
            resources={resources}
            languages={languages}
            weblichtLanguages={weblichtLanguages}
          >
            <SearchParamsProvider {...searchParams}>
              <SearchResults searchId={searchId} />
            </SearchParamsProvider>
          </AggregatorDataProvider>
        )}
      </Container>
    </>
  )
}

export default Search
