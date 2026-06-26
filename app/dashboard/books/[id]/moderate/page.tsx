import{createClient} from '@/lib/supabase/server'
import{notFound, redirect} from 'next/navigation'
import ModerationList from './ModerationList'

export default async function ({
    params, }:{
        params: Promise<{id: string}>
}){
    const{id}=await params
    const supabase=await createClient()

    const{data: {user}}=await supabase.auth.getUser()
    if(!user) redirect('/login')

        const{data: book}=await supabase
        .from('memory_books')
        .select('*')
        .eq('id', id)
        .single()

    if(!book) notFound()
        if(book.owner_id !== user.id) redirect('/dashboard')

            const{data: entries}=await supabase
            .from('entries')
            .select('*')
            .eq('book_id', id)
            .order('created_at', {ascending: false})

    return(
        <main className="max-w-2xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Moderate: {book.title}</h1>
            <ModerationList entries={entries ?? []}/>
        </main>
    )
}