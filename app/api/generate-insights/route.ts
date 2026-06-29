import{createClient} from '@/lib/supabase/server'
import{NextRequest, NextResponse} from 'next/server'

export async function POST(request: NextResponse){
    const{bookId}=await request.json()
    const supabase=await createClient()

    const {data: {user}}=await supabase.auth.getUser()
    if(!user){
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }
    const{data: book}=await supabase.from('memory_books').select('owner_id, title').eq('id', bookId).single()

    if(!book || book.owner_id !== user.id){
        return NextResponse.json({error: 'Forbidden'}, {status: 403})
    }

    const {data: entries}=await supabase.from('entries').select('contributor_name, text_response').eq('book_id', bookId).eq('is_approved', true)

    if(!entries || entries.length===0){
        return NextResponse.json({error: 'No entries to analyze'}, {status: 400})
    }
    const entriesText=entries
    .map((e)=> `${e.contributor_name || 'Anonymous'}: ${e.text_response}`).join('\n')

    const response=await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Authorization :`Bearer ${process.env.OPENAI_API_KEY}`,},
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            max_tokens: 500,
            messages: [{
                role: 'user',
                content: `Here are messages friends/family wrote in a memory book called "${book.title}":\n\n${entriesText}\n\nWrite a warm, short (3-4 sentence) summary capturing the overall themes and feelings expressed. Then list 2-3 short tags describing the dominant mood (e.g. "nostaligic","funny", "heartfelt").`,
            },],
        }),
    })

    const data=await response.json()
    if(!response.ok){
        console.error('OpenAi API error:', data)
        return NextResponse.json({error: data.error?.message ?? 'AI request failed'},{status:500})
    }
    const insightText=data.choices?.[0]?.message?.content ?? 'Unable to generate insights.'
    return NextResponse.json({insight: insightText})
}

