const path = require('path')

module.exports = {
  webpack(cfg, { isServer, nextRuntime }) {
    console.log(cfg.entry)
    const origEntry = cfg.entry
    // console.trace('overwriting entry')
    cfg.entry = async () => {
      // console.trace('calling origEntry')
      const origEntries = await origEntry()

      if (isServer && nextRuntime === 'nodejs') {
        const curEntry = origEntries['pages/_app']
        origEntries['pages/_app'] = [
          path.join(__dirname, 'lib/get-data.js'),
          ...curEntry,
        ]
        // console.trace('origEntries', origEntries)
      }
      return origEntries
    }
    return cfg
  },
  experimental: {
    outputFileTracingIncludes: {
      '/index': ['include-me/*'],
      '/route1': ['include-me/*'],
    },
    outputFileTracingExcludes: {
      '/index': ['public/exclude-me/**/*'],
      '/route1': ['public/exclude-me/**/*'],
    },
    turbotrace: {
      contextDirectory: path.join(__dirname, '..', '..', '..', '..'),
    },
  },
}
