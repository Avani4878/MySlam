'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ContributeForm({ bookId, questions }: { bookId: string
  questions:string[]
 }) {
  const [name, setName] = useState('')
  const[answers, setAnswers]=useState<string[]>(questions.map(()=>''))
  const [photo, setPhoto] = useState<File | null>(null)
  const[isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const[uploading, setUploading] = useState(false)
  
  const mediaRecorderRef= useRef<MediaRecorder | null>(null)
  const chunksRef=useRef<Blob[]>([])
  const supabase = createClient()

  function updateAnswer(index: number, value: string){
    setAnswers((prev)=> prev.map((a,i)=> (i=== index ? value:a)))
  }

  async function startRecording(){
    const stream=await navigator.mediaDevices.getUserMedia({audio:true})
    const recorder=new MediaRecorder(stream)
    chunksRef.current=[]

    recorder.ondataavailable=(e)=> chunksRef.current.push(e.data)
    recorder.onstop =() => setAudioBlob(new Blob(chunksRef.current, {type: 'audio/webm'}))
    recorder.start()
    mediaRecorderRef.current=recorder
    setIsRecording(true)
  }

  function stopRecording(){
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setUploading(true)

    try{
      let photoUrl: string | null=null
      let voiceUrl: string | null=null

      if(photo){
        const fileExt=photo.name.split('.').pop()
        const fileName=`${bookId}-${Date.now()}.${fileExt}`
        const{error: uploadError}=await supabase.storage
        .from('entry-photos')
        .upload(fileName, photo)

        if(uploadError) throw uploadError
        photoUrl=supabase.storage.from('entry-photos').getPublicUrl(fileName).data.publicUrl
      }

      if(audioBlob){
        const fileName=`${bookId}-${Date.now()}.webm`
        const{error: uploadError}=await supabase.storage
          .from('entry-voices')
          .upload(fileName, audioBlob)

        if(uploadError) throw uploadError

        voiceUrl=supabase.storage.from('entry-voices').getPublicUrl(fileName).data.publicUrl
      }

      const rows=questions.map((questions, i)=> ({
        book_id:bookId,
        contributor_name: name,
        prompt_question: questions,
        text_response: answers[i],
        photo_url: i===0?photoUrl: null,
        voice_url: i===0?voiceUrl: null,
      }))
      
      const { error: insertError } = await supabase.from('entries').insert(rows)
  
      if (insertError) throw insertError
  
      setSubmitted(true)
    } catch(err: any){
      setError(err.message ?? 'Something went wrong')
    } finally {
      setUploading(false)
    }
  }

  if (submitted) {
    return (
      <div className="p-4 bg-green-50 border border-green-300 rounded text-green-800">
        Thanks, {name}! Your page has been submitted for review.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border rounded p-2"
        required
      />
      {questions.map((q,i)=> (
        <div key={i}>
          <label className="block text-sm font-medium mb-1">{q}</label>
          <textarea
          value={answers[i]}
          onChange={(e)=> updateAnswer(i, e.target.value)}
          className="w-full border rounded p-2 h-20"
          required
          />
        </div>
      ))}
      
      <div>
        <label className="block text-sm font-medium mb-1">Your favourite photo of us</label>
        <input
        type="file"
        accept="image/*"
        onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        className="w-full"/>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Leave me some voice note?</label>
        {!isRecording && !audioBlob && (
          <button
          type="button"
          onClick={startRecording}
          className="px-3 py-1 border rounded">
            🎙️ Start Recording
          </button>
        )}
        {isRecording && (
          <button
          type="button"
          onClick={stopRecording}
          className="px-3 py-1 border rounded bg-red-500 txt-white">
            ◽ Stop Recording
          </button>
        )}
        {audioBlob && !isRecording && (
          <div className="flex items-center gap-2">
            <audio controls src={URL.createObjectURL(audioBlob)}/>
            <button
            type="button"
            onClick={()=> setAudioBlob(null)}
            className="text-sm text-red-500">
              Remove
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" className="w-full bg-black text-white rounded p-2" disabled={uploading}>
        {uploading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}