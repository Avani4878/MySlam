'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ContributeForm({ bookId }: { bookId: string }) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const { error: insertError } = await supabase.from('entries').insert({
      book_id: bookId,
      contributor_name: name,
      text_response: message,
    })

    if (insertError) {
      setError(insertError.message)
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="p-4 bg-green-50 border border-green-300 rounded text-green-800">
        Thanks, {name}! Your message has been submitted for review.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border rounded p-2"
        required
      />
      <textarea
        placeholder="Write your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full border rounded p-2 h-32"
        required
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" className="w-full bg-black text-white rounded p-2">
        Submit
      </button>
    </form>
  )
}