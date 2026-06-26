import{createClient} from '@/lib/supabase/server'
import{notFound} from 'next/navigation'
import Link from'next/link'

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

    if(error || !book){
        notFound()
    }

    return(
        <main className ="p-8 max-w-2xl mx-auto">
            <BookHeader book={book}/>
            <Link href={`/dashboard/books/${book.id}/moderate`} className="inline-block mt-4 text-blue-600 underline">
            Moderate Contributions ➡️
            </Link>
            <div className="mt-8 space-y-4">
                {entries && entries.length > 0 ? (
                    entries.map((entry) => (
                        <div key={entry.id} className="border rounded p-4">
                            <p className ="font-semibold text-sm text-gray-600">{entry.contributor_name}</p>
                            {entry.text_response && <p className ="mt-1">{entry.text_response}</p>}
                            {entry.photo_url && (<img src={entry.photo_url} alt="" className="mt-2 max-w-xs rounded" />)}
                            {entry.voice_url && <audio controls src={entry.voice_url} className="mt-2" />}
                        </div>
                    ))
                ) : (
                    <p className ="text-gray-500">No entries yeat.</p>
                )}
            </div>
        </main>
    )
}

function BookHeader({book} : {book: any}){
    if(book.template === 'scrapbook'){
        return(
            <div className="border-4 border-dashed border-amber-400 bg-amber-50 p-6 rounded-lg">
                <h1 className="text-3xl font-bold font-serif text-amber-900">{book.title}</h1>
                <p className="text-amber-700 mt-1 text-sm"> 📷 Scrapbook Style . {book.privacy_level}</p>
            </div>
        )
    }

    if(book.template === 'timeline'){
        return(
            <div className="border-l-4 border-blue-500 pl-4">
                <h1 className="text-3xl font-bold">{book.title}</h1>
                <p className="text-blue-700 mt-1 text-sm">🕒 Timeline View . {book.privacy_level}</p>
            </div>
        )
    }

    return(
        <div className="border-b pb-4">
            <h1 className="text-3xl font-bold">{book.title}</h1>
            <p className="text-gray-500 mt-1">📖 Classic View . {book.privacy_level}</p>
        </div>
    )
}


       

