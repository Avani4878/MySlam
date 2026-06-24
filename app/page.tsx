import {createClient} from '@/lib/supabase/server'

export default async function Home(){
  const supabase=await createClient()
  const {data,error}=await supabase.auth.getSession()

  return(
    <main className="p-8">
      <h1 className="text-2xl font-bold">MySlam-Connection test</h1>
      {error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : (
        <p className="text-green-500">Session is valid.</p>
      )}
    </main>
  )
}