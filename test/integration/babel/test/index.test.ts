/* eslint-env jest */

import { findPort, killApp, launchApp, renderViaHTTP } from 'next-test-utils'
import { join } from 'path'
import { ChildProcess } from 'child_process'

// test suits
import rendering from './rendering'

let appPort: number
let server: ChildProcess
;(process.env.TURBOPACK ? describe.skip : describe)('Babel', () => {
  beforeAll(async () => {
    appPort = await findPort()
    server = await launchApp(join(__dirname, '../'), appPort)

    // pre-build all pages at the start
    await Promise.all([renderViaHTTP(appPort, '/')])
  })
  afterAll(() => killApp(server))

  rendering('Rendering via HTTP', (p, q) => renderViaHTTP(appPort, p, q))
})
