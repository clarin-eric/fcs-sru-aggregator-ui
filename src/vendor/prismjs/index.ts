import Prism from './global'

import plain from './languages/prism-plain'
import regex from './languages/prism-regex'

import cql from './languages/prism-cql'
import fcsCql from './languages/prism-fcs-cql'
import fcsFcsql from './languages/prism-fcs-fcsql'
import fcsLexcql from './languages/prism-fcs-lexcql'

import matchBraces from './plugins/match-braces/prism-match-braces'

const languages = [plain, regex, cql, fcsCql, fcsFcsql, fcsLexcql] as const
const plugins = [matchBraces] as const

Prism.components.add(...languages)
Prism.components.add(...plugins)

export default Prism
