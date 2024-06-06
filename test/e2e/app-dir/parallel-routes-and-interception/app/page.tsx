import Link from 'next/link'
import React from 'react'

export default function Page() {
  return (
    <ul>
      <li>
        <Link href="/collision">collision</Link>
      </li>
      <li>
        <Link href="/other">other</Link>
      </li>
    </ul>
  )
}
