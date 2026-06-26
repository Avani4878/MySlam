'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ContributeForm({ bookId }: { bookId: string }) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const[isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const[uploading, setUploading] = useState(false)
  
  const mediaRecorderRef= useRef<MediaRecorder | null>(null)
  const chunksRef=useRef<Blob[]>([])
  const supabase = createClient()

  async function startRecording(){
    const stream=await navigator.mediaDevices.getUserMedia({audio:true})
    const recorder=new MediaRecorder(stream)
    chunksRef.current=[]

    recorder.ondataavailable=(e)=> chunksRef.current.push(e.data)
    recorder.onstop =() => {
      const blob=new Blob(chunksRef.current, {type: 'audio/webm'})
      setAudioBlob(blob)
    }

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

        const{data: publicUrlData}=supabase.storage
           .from('entry-photos')
           .getPublicUrl(fileName)
        photoUrl=publicUrlData.publicUrl
      }

      if(audioBlob){
        const fileName=`${bookId}-${Date.now()}.webm`
        const{error: uploadError}=await supabase.storage
          .from('entry-voices')
          .upload(fileName, audioBlob)

        if(uploadError) throw uploadError

        const{data: publicUrlData}=supabase.storage
          .from('entry-voices')
          .getPublicUrl(fileName)
        voiceUrl=publicUrlData.publicUrl
      }
      
      const { error: insertError } = await supabase.from('entries').insert({
        book_id: bookId,
        contributor_name: name,
        text_response: message,
        photo_url: photoUrl,
        voice_url: voiceUrl,
      })
  
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
        Thanks, {name}! Your message has been submitted for review.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border rounded p-2"
        required
      />
      <textarea
        placeholder="Write your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full border rounded p-2 h-32"
        required
      />
      <div>
        <label className="block text-sm font-medium mb-1">Photo (Optional)</label>
        <input
        type="file"
        accept="image/*"
        onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        className="w-full"/>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Voice note(Optional)</label>
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