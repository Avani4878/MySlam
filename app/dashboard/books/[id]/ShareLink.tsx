'use client'

import{useState} from 'react'

export default function ShareLink({bookId}: {bookId: string}){
    const[copied, setCopied]=useState(false)

    function copyLink(){
        const url=`${window.location.origin}/contribute/${bookId}`
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return(
        <button onClick={copyLink}
        className="px-4 py-2 bg-amber-600 texxt-white rounded font-medium">
            {copied? '✅Link Copied': '🔗Copy My Slam Book Link'}
        </button>
    )
}