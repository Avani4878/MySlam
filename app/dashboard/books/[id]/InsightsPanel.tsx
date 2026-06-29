'use client'

import {useState} from 'react'

export default function InsightPanel({bookId}: {bookId: string}){
    const[insight, setInsight]=useState('')
    const[loading, setLoading]=useState(false)
    const[error, setError]=useState('')

    async function generateInsights(){
        setLoading(true)
        setError('')

        try{
            const res= await fetch('/api/generate-insights', {
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify({bookId}),
            })

            const data=await res.json()

            if(!res.ok){
                setError(data.error ?? 'Failed to generate insights')
                return
            }
            setInsight(data.insight)
        }catch{
            setError('Something went wrong')
        }finally{
            setLoading(false)
        }
    }

    return(
        <div className="mt-8 border-t pt-4">
            <h3 className="font-semibold mb-2">AI Insights</h3>
            <button
            onClick={generateInsights}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50">
                {loading ? 'Generating...' : '✨ Generate Insights'}
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {insight && (
                <div className="mt-4 p-4 bg-purple-50 rounded whitespace-pre-wrap">{insight}</div>
            )}
        </div>
    )
}