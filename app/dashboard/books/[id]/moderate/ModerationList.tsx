'use client'
import{useState} from 'react'
import{createClient} from '@/lib/supabase/client'

type Entry={
    id: string
    contributor_name: string | null
    text_response: string | null
    photo_url: string | null
    voice_url: string | null
    is_approved: boolean
}
export default function ModerationList({entries: initialEntries}: {entries: Entry[]}){
    const[entries, setEntries]=useState(initialEntries)
    const supabase=createClient()

    async function toggleApproval(entryId: string, currentStatus: boolean){
        const{error}=await supabase
        .from('entries')
        .update({is_approved: !currentStatus})
        .eq('id', entryId)

        if(!error){
            setEntries((prev) => prev.map((e) => (e.id ===entryId ? {...e, is_approved: !currentStatus} : e)))
        }
    }

    async function deleteEntry(entryId: string){
        const{error}=await supabase.from('entries').delete().eq('id', entryId)
        if(!error){
            setEntries((prev)=> prev.filter((e) => e.id !== entryId))
        }
    }

    if(entries.length===0){
        return <p className="text-gray-500">No Contribution Yet!</p>
    }

    return(
        <ul className="space-y-4">
            {entries.map((entry) => (
                <li key={entry.id} className="border rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">{entry.contributor_name || 'Anonymous'}</span>
                        <span
                        className={`text-xs px-2 py-1 rounded ${
                            entry.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                            {entry.is_approved ? 'Approved' : 'Pending'}
                        </span>
                    </div>
                    {entry.text_response && <p className="text-gray-700 mb-2">{entry.text_response}</p>}
                    {entry.photo_url && (
                        <img src={entry.photo_url} alt="Contribution" className="mx-w-xs rounded mb-2"/>
                    )}
                    {entry.voice_url && <audio controls src={entry.voice_url} className="mb-2" />}
                    <div className="flex gap-2 mt-2">
                        <button 
                        onClick={() => toggleApproval(entry.id, entry.is_approved)}
                        className="px-3 py-1 text-sm border rounded">
                            {entry.is_approved ? 'Unapprove' : 'Approve'}
                        </button>
                        <button
                        onClick={()=> deleteEntry(entry.id)}
                        className="px-3 py-1 text-sm border rounded text-red-600">
                            Delete
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    )
}