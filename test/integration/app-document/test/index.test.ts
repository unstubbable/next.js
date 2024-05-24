/* eslint-env jest */

import { join } from 'path'
import { renderViaHTTP, findPort, launchApp, killApp } from 'next-test-utils'

// test suites
import rendering from './rendering'
import client from './client'
import csp from './csp'
import { ChildProcess } from 'child_process'

let output: string
let appPort: number
let server: ChildProcess

const collectOutput = (message) => {
  output += message
}

describe('Document and App', () => {
  beforeAll(async () => {
    output = ''
    appPort = await findPort()
    server = await launchApp(join(__dirname, '../'), appPort, {
      onStdout: collectOutput,
      onStderr: collectOutput,
    })

    // pre-build all pages at the start
    await Promise.all([renderViaHTTP(appPort, '/')])
  })
  afterAll(() => killApp(server))

  it('should not have any missing key warnings', async () => {
    await renderViaHTTP(appPort, '/')
    expect(output).not.toMatch(
      /Each child in a list should have a unique "key" prop/
    )
  })

  rendering('Rendering via HTTP', (p, q) =>
    renderViaHTTP(appPort, p, q, {
      headers: { 'user-agent': 'Safari' },
    })
  )
  client({ appPort })
  csp({ appPort })
})
