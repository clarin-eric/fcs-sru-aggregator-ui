import { useQuery } from '@tanstack/react-query'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Row from 'react-bootstrap/Row'
import { type ToggleMetadata } from '@restart/ui/Dropdown'
import { type AxiosInstance } from 'axios'
import { getInitData } from '@/utils/api'

// TODO: SVG, for inverted/specific colors: https://stackoverflow.com/a/52041765/9360161
import gearIcon from 'bootstrap-icons/icons/gear-fill.svg'
import fcsLogoUrl from '@images/logo-fcs.png'
import fcsLogoDarkModeUrl from '@images/logo-fcs-dark.png'

import './search.css'

const numberOfResultsOptions = [10, 20, 50, 100, 200, 250]

export interface SearchProps {
  axios: AxiosInstance
}

function Search({ axios }: SearchProps) {
  // const queryClient = useQueryClient()

  // ------------------------------------------------------------------------
  // initialization

  const {
    isPending,
    isError,
    data, //: { languages, resources, weblichtLanguages },
    error,
  } = useQuery({
    queryKey: ['init'],
    queryFn: getInitData.bind(null, axios),
  })

  // ------------------------------------------------------------------------
  // event handlers

  function handleToggle(nextShow: boolean, meta: ToggleMetadata) {
    console.log('handleToggle', nextShow, meta)
  }
  function handleSelect(eventKey: string | null, event: React.SyntheticEvent<unknown>) {
    console.log('handleSelect', eventKey, event)
  }

  function handleChangeNumberOfResults(event: React.ChangeEvent<HTMLSelectElement>) {
    console.log('handleChangeNumberOfResults', event, event.target.value)
  }

  // ------------------------------------------------------------------------
  // UI

  return (
    <Container>
      <Row>
        <Col className="text-center">
          <picture>
            <source srcSet={fcsLogoUrl} media="(prefers-color-scheme: light)" />
            <source srcSet={fcsLogoDarkModeUrl} media="(prefers-color-scheme: dark)" />
            <img src={fcsLogoUrl} className="logo" alt="FCS logo" />
          </picture>
        </Col>
      </Row>

      <Row>
        <Col>
          <search id="fcs-query">
            <InputGroup size="lg">
              <Form.Control
                placeholder="Elephant"
                aria-label="search query input"
                aria-describedby="fcs-search-input-button"
                className="text-center"
              />
              <Button variant="outline-secondary" id="fcs-search-input-button">
                {/* TODO: visually-hidden span with description? */}
                Search
              </Button>
            </InputGroup>
            <div id="fcs-query-filters" className="mt-2 lh-lg text-center">
              Perform a{' '}
              <Dropdown className="d-inline-block" onToggle={handleToggle} onSelect={handleSelect}>
                <Dropdown.Toggle size="sm" variant="outline-dark" className="mx-1 pe-2 no-arrow">
                  Full-text Search{' '}
                  <img
                    src={gearIcon}
                    aria-hidden="true"
                    width={10}
                    className="align-top rounded-circle"
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as="button" eventKey="cql">
                    Text layer Contextual Query Language (CQL)
                  </Dropdown.Item>
                  <Dropdown.Item as="button" eventKey="fcs">
                    Multi-layer Federated Content Search Query Language (FCS-QL)
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>{' '}
              in{' '}
              <Button size="sm" variant="outline-dark" className="mx-1 pe-2">
                XYZ Resources{' '}
                <img
                  src={gearIcon}
                  aria-hidden="true"
                  width={10}
                  className="align-top rounded-circle"
                />
              </Button>{' '}
              from{' '}
              <Button size="sm" variant="outline-dark" className="mx-1 pe-2">
                XYZ Institutions{' '}
                <img
                  src={gearIcon}
                  aria-hidden="true"
                  width={10}
                  className="align-top rounded-circle"
                />
              </Button>{' '}
              in{' '}
              <Button size="sm" variant="outline-dark" className="mx-1 pe-2">
                XYZ Languages{' '}
                <img
                  src={gearIcon}
                  aria-hidden="true"
                  width={10}
                  className="align-top rounded-circle"
                />
              </Button>{' '}
              with up to{' '}
              <Form.Select
                size="sm"
                className="d-inline-block w-auto mx-1"
                onChange={handleChangeNumberOfResults}
              >
                {numberOfResultsOptions.map((value) => (
                  <option value={value} key={value}>
                    {value}
                  </option>
                ))}
              </Form.Select>{' '}
              results per endpoint.
            </div>
          </search>
        </Col>
      </Row>

      <Row>
        <Col>Results ...</Col>
      </Row>
      <Row>
        <Col>
          {isPending ? 'Loading ...' : null}
          <br />
          {isError ? error.message : null}
          <br />
          {JSON.stringify(data, undefined, 2)}
        </Col>
      </Row>
    </Container>
  )
}

export default Search
