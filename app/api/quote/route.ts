import { NextResponse } from 'next/server'

const FALLBACK_QUOTES = [
  '오늘도 한 잔의 여유를.',
  '인생은 너무 짧다. 나쁜 술을 마시기엔.',
  '좋은 술과 좋은 대화는 가장 훌륭한 동반자.',
]

export async function GET() {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), 4000)
  try {
    const res = await fetch('https://api.quotable.io/random?maxLength=80', {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    })
    clearTimeout(id)
    if (!res.ok) throw new Error('bad status')
    const data = await res.json()
    const content = (data && data.content) ? String(data.content) : ''
    if (content) {
      return NextResponse.json({ content }, { headers: { 'Cache-Control': 'no-store' } })
    }
    const fb = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]
    return NextResponse.json({ content: fb }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    clearTimeout(id)
    const fb = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]
    return NextResponse.json({ content: fb }, { headers: { 'Cache-Control': 'no-store' } })
  }
}


