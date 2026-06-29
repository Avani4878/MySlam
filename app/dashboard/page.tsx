import Link from 'next/link'
import{createClient} from '@/lib/supabase/server'
import{redirect} from 'next/navigation'

export default async function DashboardPage(){
    const supabase=await createClient()
    const{data: {user}}=await supabase.auth.getUser()

    if(!user) redirect('/login')

    const{data: books}=await supabase
    .from('memory_books')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', {ascending: true})

    async function logout(){
        'use server'
        const supabase=await createClient()
        await supabase.auth.signOut()
        redirect('/login')
    }

    if(books && books.length===1){
        redirect(`/dashboard/books/${books[0].id}`)
    }
    return(
        <main className="p-8 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Welcome, {user?.email}</h1>
                <form action={logout}>
                    <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded">Log Out</button>
                </form>
            </div>

            <ul className="space-y-3 mb-6">
                {books?.map((book)=> (
                    <li key={book.id}>
                        <Link href={`/dashboard/books/${book.id}`} className="block p-4 border rounded hover:bg-gray-50">
                        <h2 className="font-semibold">{book.title}</h2>
                        <p className="text-sm text-gray-500">{book.privacy_level}</p>
                        </Link>
                    </li>
                ))}
            </ul>

            <Link href="/dashboard/new" className="inline-block px-4 py-2 bg-blue-600 text-white rounded">
            + Create Another Slam Book</Link>
        </main>
    )
}