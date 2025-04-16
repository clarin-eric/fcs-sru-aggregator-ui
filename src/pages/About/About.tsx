import Container from 'react-bootstrap/Container'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router'

import AppStore from '@/stores/app'

function About() {
  const appTitleHead = AppStore.getState().appTitleHead

  return (
    <>
      <Helmet>
        <title>{appTitleHead} – About</title>
      </Helmet>
      <Container>
        <h1 className="h1">About the Federated Content Search (FCS) Aggregator</h1>

        <div>
          <h2 className="h2">People</h2>
          <p>The Aggregator was developed by:</p>
          <ul>
            {/* TODO: add affiliations? */}
            <li>Emanuel Dima</li>
            <li>Erik Körner</li>
            <li>Leif-Jöran Olsson</li>
            <li>Yana Panchenko</li>
            <li>Oliver Schonefeld</li>
            <li>Dieter Van Uytvanck</li>
          </ul>
        </div>

        <div>
          <h2 className="h2">Statistics</h2>
          <p>
            View <Link to="/stats">endpoint statistics</Link> to see details about scanned
            resources, performed searches, warnings and errors.
          </p>
        </div>

        <div>
          <h2 className="h2">Privacy Policy</h2>
        </div>

        <div>
          <h2 className="h2">Source Code</h2>
          <p>
            The Aggregator source code and documentation are published on{' '}
            <a href="https://github.com/clarin-eric/fcs-sru-aggregator">GitHub</a> and are made
            available under the{' '}
            <a href="https://github.com/clarin-eric/fcs-sru-aggregator/blob/master/LICENSE">
              GPL 3.0 license
            </a>
            .
          </p>
          <p>
            The full license can be found in the source code repository and in the packaged sources
            and binaries.
          </p>
        </div>

        <div>
          <h2 className="h2">Technology Used</h2>
          <p>The Aggregator uses the following software components:</p>
          <ul>
            <li>
              <a href="https://www.dropwizard.io/">Dropwizard</a> (
              <a href="https://github.com/dropwizard/dropwizard/blob/release/4.0.x/LICENSE">
                Apache License 2.0
              </a>
              )
            </li>
          </ul>
        </div>

        <div>
          <h2 className="h2">Funding</h2>
        </div>
      </Container>
    </>
  )
}

export default About
