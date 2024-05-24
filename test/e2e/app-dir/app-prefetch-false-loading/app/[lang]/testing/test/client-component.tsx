'use client'
import Link from 'next/link'

export default function IndexPage() {
  return (
    <div>
      On client
      <Link href={'/en/testing'} prefetch={false}>
        To /en/testing
      </Link>
    </div>
  )
}
