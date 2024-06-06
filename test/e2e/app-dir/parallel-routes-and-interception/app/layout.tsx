import React from 'react'
import './style.css'

export default function Root({ children }) {
  return (
    <html>
      <body>
        <div className="parallel" title="children">
          {children}
        </div>
      </body>
    </html>
  )
}
