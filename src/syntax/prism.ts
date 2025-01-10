type Prism = typeof Prism

// NOTE: with Prism v1, only those languages/plugins etc. loaded here will be available, trying to add languages later using 'import' will not work as expected!
// this might not be an issue anymore with Prism v2 but it has not yet been released!

import Prism from 'prismjs/components/prism-core'

// set to manual highlighting only
Prism.manual = true

// the languages we want to use
// - SRU CQL
import './languages/prism-cql'
// - FCS query languages
import './languages/prism-fcs-cql'
import './languages/prism-fcs-fcsql'
import './languages/prism-fcs-lexcql'

export default Prism
