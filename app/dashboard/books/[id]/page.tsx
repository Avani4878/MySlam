import{createClient} from '@/lib/supabase/server'
import{notFound} from 'next/navigation'

export default async function BookDetailPage({params, }: {params: Promise<{id: string}>}){
    const{id}=await params
    const supabase=await createClient()

    const{data: book, error}=await supabase
    .from('memory_books')
    .select('*')
    .eq('id', id)
    .single()

    if(error || !book){
        notFound()
    }

    return(
        <main className ="p-8 max-w-2xl mx-auto">
            <BookHeader book={book}/>
            <div className="mt-8">
                <p className="text-gray-500">No entries yet.</p>
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
       

