import { useQuery } from '@tanstack/react-query'
import { type AxiosInstance } from 'axios'
import { useEffect, useState } from 'react'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'

import { getInitData, type Resource } from '@/utils/api'
import { fromApi, getResourceIDs } from '@/utils/resources'
import { type LanguageCode2NameMap } from '@/utils/search'
import SearchInput, { type SearchData } from './SearchInput'
import SearchResults from './SearchResults'

import fcsLogoDarkModeUrl from '@images/logo-fcs-dark.png'
import fcsLogoUrl from '@images/logo-fcs.png'

import './styles.css'

// --------------------------------------------------------------------------
// types

export interface SearchProps {
  axios: AxiosInstance
}

// --------------------------------------------------------------------------
// component

function Search({ axios }: SearchProps) {
  // REST API state
  const [resources, setResources] = useState<Resource[]>([])
  const [languages, setLanguages] = useState<LanguageCode2NameMap>()
  const [, setWeblichtLanguages] = useState<string[]>()

  const [searchResourceIDs, setSearchResourceIDs] = useState<string[] | null>(null)

  const [hasSearch, setHasSearch] = useState(false)
  const [searchParams, setSearchParams] = useState<SearchData | null>(null)

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

  // ------------------------------------------------------------------------

  // on state update, this component is re-evaluated which re-evaluates the expressions below, too
  const isInputDisabled = isLoading || isError
  // console.debug('isInputDisabled', isInputDisabled, 'isLoading', isLoading, 'isError', isError)

  // ------------------------------------------------------------------------
  // event handlers

  function handleSearch(searchData: SearchData) {
    console.debug('start search:', searchData)

    setSearchResourceIDs(searchData.resourceIDs)

    setSearchParams(searchData)
    setHasSearch(true)
  }

  // ------------------------------------------------------------------------
  // utilities

  // ------------------------------------------------------------------------
  // UI

  return (
    <Container id="search">
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

      {searchParams && <SearchResults axios={axios} params={searchParams} resources={resources} languages={languages} />}
    </Container>
  )
}

export default Search
