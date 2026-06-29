'use client'

import{useState} from 'react'
import{createClient} from '@/lib/supabase/client'

export default function InviteCollaborator({bookId}: {bookId: string}){
    const[email, setEmail]=useState('')
    const[message, setMessage]=useState('')
    const[error, setError]=useState('')
    const supabase=createClient()

    async function handleInvite(e: React.FormEvent){
        e.preventDefault()
        setError('')
        setMessage('')

        const{data: profile, error: profileError}=await supabase
        .from('profiles')
        .select('id')
        .eq('username', email)
        .single()

        if(profileError || !profile){
            setError('No user found with that email.They need to sign up first.')
            return
        }

        const{error:insertError}=await supabase.from('book_collaborators').insert({
            book_id:bookId,
            user_id:profile.id,
            role: 'contributor'
        })

        if(insertError){
            setError(insertError.message)
            return
        }

        setMessage(`Invited ${email} successfully!`)
        setEmail('')
    }

    return(
        <form onSubmit={handleInvite} className="flex gap-2 mt-4">
            <input
            type="email"
            placeholder="Friend's email(must have an account)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded p-2 flex-1"
            required/>
            <button type="submit" className="px-4 py-2 bg-black text-white rounded">
                Invite
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-600 text-sm">{message}</p>}
        </form>
    )
}