import{createClient} from '@/lib/supabase/server'
import{notFound} from 'next/navigation'
import Link from'next/link'
import InviteCollaborator from './InviteCollaborator'
import InsightPanel from './InsightsPanel'

export default async function BookDetailPage({params, }: {params: Promise<{id: string}>}){
    const{id}=await params
    const supabase=await createClient()

    const{data: book, error}=await supabase
    .from('memory_books')
    .select('*')
    .eq('id', id)
    .single()

    const{data: entries} =await supabase
    .from('entries')
    .select('*')
    .eq('book_id', id)
    .eq('is_approved', true)
    .order('created_at', {ascending: false})

    type EntryRow=NonNullable<typeof entries>[number]

    const groupedEntries=(entries??[]).reduce<Record<string, EntryRow[]>>((acc, entry)=> {
        const key=entry.contributor_name || 'Anonymous'
        if(!acc[key]) acc[key]=[]
        acc[key]!.push(entry)
        return acc
    }, {})

    if(error || !book){
        notFound()
    }

    return(
        <main className ="p-8 max-w-2xl mx-auto">
            <BookHeader book={book}/>
            <Link href={`/dashboard/books/${book.id}/moderate`} className="inline-block mt-4 text-blue-600 underline">
            Moderate Contributions ➡️
            </Link>
            <div className="mt-8 space-y-6">
                {Object.keys(groupedEntries).length>0?(
                    Object.entries(groupedEntries).map(([contributor, contributorEntries])=> (
                        <div key={contributor} className="border-2 border-amber-200 rounded-lg p-4 bg-amber-50">
                            <h3 className="font-bold font-serif text-lg mb-3 text-amber-900">
                               🤷🏻‍♀️ {contributor}'s Page
                            </h3>
                            {contributorEntries.map((entry) => (
                                <div key={entry.id} className="mb-3">
                                    {entry.prompt_question && (
                                        <p className="text-sm font-semibold text-amber-700">{entry.prompt_question}</p>
                                    )}
                                    {entry.text_response && <p className="text-gray-800">{entry.text_response}</p>}
                                    {entry.photo_url && <img src={entry.photo_url} alt="" className="mt-1 max-w-xs rounded" />}
                                    {entry.voice_url && <audio controls src={entry.voice_url} className="mt-1" />}
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <p className ="text-gray-500">No Pages filled out yet.</p>
                )}
            </div>

            <InsightPanel bookId={book.id}/>

            {book.privacy_level === 'invite-only' && (
                <div className="mt-8 border-t pt-4">
                    <h3 className="font-semibold mb-2">Invite Collaborators</h3>
                    <InviteCollaborator bookId={book.id}/>
                </div>
            )}
        </main>
    )
}

function BookHeader({book} : {book: any}){
    if(book.template === 'scrapbook'){
        return(
            <div className="border-4 border-dashed border-amber-400 bg-amber-50 p-6 rounded-lg">
                <h1 className="text-3xl font-bold font-serif text-amber-900">{book.title}</h1>
                <p className="text-amber-700 mt-1 text-sm"> 📷 Scrapbook
                    <span
                    className={`text-xs px-2 py-1 rounded ml-2 ${book.privacy_level === "private" 
                        ?"bg-gray-200 text-gray-700"
                        : book.privacy_level === "link-only"
                        ?"bg-blue-100 text-blue-700"
                        :"bg-purple-100 text-purple-700"
                    }`}
                    >
                        {book.privacy_level}
                    </span>
                </p>
            </div>
        )
    }

    if(book.template === 'timeline'){
        return(
            <div className="border-l-4 border-blue-500 pl-4">
                <h1 className="text-3xl font-bold">{book.title}</h1>
                <p className="text-blue-700 mt-1 text-sm">🕒 Timeline View
                     <span
                    className={`text-xs px-2 py-1 rounded ml-2 ${book.privacy_level === "private" 
                        ?"bg-gray-200 text-gray-700"
                        : book.privacy_level === "link-only"
                        ?"bg-blue-100 text-blue-700"
                        :"bg-purple-100 text-purple-700"
                    }`}
                    >
                        {book.privacy_level}
                    </span>
                </p>
            </div>
        )
    }

    return(
        <div className="border-b pb-4">
            <h1 className="text-3xl font-bold">{book.title}</h1>
            <p className="text-gray-500 mt-1">📖 Classic View
                 <span
                    className={`text-xs px-2 py-1 rounded ml-2 ${book.privacy_level === "private" 
                        ?"bg-gray-200 text-gray-700"
                        : book.privacy_level === "link-only"
                        ?"bg-blue-100 text-blue-700"
                        :"bg-purple-100 text-purple-700"
                    }`}
                    >
                        {book.privacy_level}
                    </span>
            </p>
        </div>
    )
}