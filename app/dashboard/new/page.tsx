'use client'

import {useState, useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '@/lib/supabase/client'

type Template={
    id: string
    name: string
    description: string
}

export default function NewBookPage(){
    const[title, setTitle] = useState('')
    const[templates, setTemplates]=useState<Template[]>([])
    const[templateId, setTemplateId]=useState('')
    const[privacyLevel, setPrivacyLevel]=useState('private')
    const[error, setError]=useState('')
    const router=useRouter()
    const supabase=createClient()

    const[questions, setQuestions]=useState<string[]>([
        'What is my favourite food?',
        'Where do you see me in 10 years?',
        'Write something you dislike about me (Or hate hehe)',
        'Write something you love about me',
        'What is your favourite memory of us?',
        'Leave me a fun nickname',
        'Do you regret meeting me(If yes Why?, if Not Why not?)'
    ])

    function updateQuestion(index: number, value: string){
        setQuestions((prev) => prev.map((q,i) => (i===index ? value:q)))
    }

    function addQuestion(){
        setQuestions((prev) => [...prev, ''])
    }

    function removeQuestion(index: number){
        setQuestions((prev)=> prev.filter((_, i) => i !== index))
    }

    useEffect(() => {
        async function loadTemplates(){
            const{data} = await supabase.from('templates').select('id, name, description')
            if(data){
                setTemplates(data)
                if(data.length>0) setTemplateId(data[0].id)
            }
        }
        loadTemplates()
    }, [])

    async function handleCreate(e: React.FormEvent){
        e.preventDefault()
        setError('')

        const {data: {user}}=await supabase.auth.getUser()
        if(!user){
            setError('You must be logged in.')
            return
        }

        const selectedTemplate=templates.find((t) => t.id === templateId)

        const{data, error : insertError} = await supabase
        .from('memory_books')
        .insert({
            owner_id: user.id,
            title,
            template: selectedTemplate?.name??'classic',
            privacy_level: privacyLevel,
            questions: questions.filter((q)=> q.trim() !== '')
        })
        .select()
        .single()

        if(insertError){
            setError(insertError.message)
            return
        }
        router.push(`/dashboard/books/${data.id}`)
    }

    return(
        <main className="max-w-md mx-auto mt-12 p-6">
            <h1 className="text-2xl font-bold mb-6"> Create a Memory Book</h1>
            <form onSubmit= {handleCreate} className="space-y-4">
                <input
                    type="text"
                    placeholder="Book Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                />
                <div>
                    <label className="block text-sm font-medium mb-1">Template</label>
                    <select
                        value={templateId}
                        onChange={(e) => setTemplateId(e.target.value)}
                        className="w-full border rounded p-2">
                        {templates.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name} - {t.description}
                            </option>
                        ))}
                        </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Slam Book Questions</label>
                    {questions.map((q, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                            <input
                            type="text"
                            value={q}
                            onChange={(e) => updateQuestion(i, e.target.value)}
                            className="flex-1 border rounded p-2 text-sm"/>
                            <button type="button" onClick={()=> removeQuestion(i)} className="text-red-500 px-2">
                                ❌
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={addQuestion} className="text-sm text-blue-600 underline">
                        + Add a question
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Privacy</label>
                    <select
                        value={privacyLevel}
                        onChange={(e) => setPrivacyLevel(e.target.value)}
                        className="w-full border rounded p-2"
                    >
                        <option value="private">Private (only me)</option>
                        <option value="link-only">Link only (anyone with link)</option>
                        <option value="invite-only">Invite-only (specific people)</option>
                    </select>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" className="w-full bg-black text-white rounded p-2 hover:bg-gray-800 transition">
                    Create Book
                    </button>
            </form>
        </main>
    )
}