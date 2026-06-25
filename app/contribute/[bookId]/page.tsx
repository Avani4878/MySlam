import{createClient} from'@/lib/supabase/server'
import{notFound} from 'next/navigation'
import ContributeForm from './ContributeForm'

export default async function ContributePage({
    params,}: {
        params: Promise<{bookId: string}>}) {
            const{bookId}=await params
            const supabase=await createClient()

    const{data: book, error}=await supabase
    .from('memory_books')
    .select('*')
    .eq('id', bookId)
    .single()

    if(error || !book){
        notFound()
    }

    return(
        <main className="p-6 max-w-md mx-auto mt-12">
            <h1 className="text-2xl font-bold mb-1">Contribute to "{book.title}"</h1>
            <p className ="text-gray-500 mb-6">Leave a message, photo, or voice note.</p>
            <ContributeForm bookId={book.id}/>
        </main>
    )
}