'use client'

import{useState} from 'react'
import{useRouter} from 'next/navigation'
import{createClient} from '@/lib/supabase/client'

export default function LoginPage(){
    const[email,setEmail]=useState('')  
    const[password,setPassword]=useState('')
    const[error,setError]=useState('')
    const router=useRouter()
    const supabase=createClient()

    async function handleLogin(e: React.FormEvent){
        e.preventDefault()
        const{error}=await supabase.auth.signInWithPassword({email,password})
        if(error){
            setError(error.message)
            return 
        }
        router.push('/dashboard')
    }

    return(
        <main className="max-w-sm mx-auto mt-20 p-6">
            <h1 className="text-2xl font-bold mb-6">Log in to MySlam</h1>
            <form onSubmit={handleLogin} className="space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-black text-white rounded p-2 hover:bg-gray-800 transition"
                >
                    Log In
                </button>
            </form>
        </main>
    )
}

