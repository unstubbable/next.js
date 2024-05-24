/* eslint-env jest */

import { join } from 'path'
import { renderViaHTTP, findPort, launchApp, killApp } from 'next-test-utils'
import { ChildProcess } from 'child_process'

let appPort: number
let server: ChildProcess

describe('Document and App', () => {
  beforeAll(async () => {
    appPort = await findPort()
    server = await launchApp(join(__dirname, '../'), appPort)

    // pre-build all pages at the start
    await Promise.all([renderViaHTTP(appPort, '/')])
  })

  afterAll(() => killApp(server))

  it('should not have any missing key warnings', async () => {
    const html = await renderViaHTTP(appPort, '/')
    expect(html).toMatch(/<div>Hello World!!!<\/div>/)
  })
})
