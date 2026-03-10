"use client"
import { useState, useEffect } from 'react'

export function DateTimeDisplay() {
  const [dateTime, setDateTime] = useState<Date | null>(null)

  useEffect(() => {
    // 클라이언트에서만 시간 값을 설정해 SSR/CSR 불일치 방지
    setDateTime(new Date())

    const timer = setInterval(() => {
      setDateTime(new Date())
    }, 1000) // 1초마다 업데이트

    return () => clearInterval(timer)
  }, [])

  // 초기 SSR 시점과 첫 클라이언트 렌더를 맞추기 위해, 마운트 전에는 렌더링하지 않음
  if (!dateTime) {
    return null
  }

  const year = dateTime.getFullYear()
  const month = dateTime.getMonth() + 1
  const day = dateTime.getDate()
  const weekday = dateTime.toLocaleDateString('ko-KR', { weekday: 'short' })
  const hours = dateTime.getHours().toString().padStart(2, '0')
  const minutes = dateTime.getMinutes().toString().padStart(2, '0')
  const seconds = dateTime.getSeconds().toString().padStart(2, '0')

  return (
    <div className="bar-time-display-card">
      <div className="digital-date-section">
        <div className="digital-year">{year}</div>
        <div className="digital-date">
          {month.toString().padStart(2, '0')}.{day.toString().padStart(2, '0')}
        </div>
        <div className="digital-weekday">{weekday}</div>
      </div>
      <div className="digital-time-section">
        <div className="digital-time">
          <span className="digital-digit">{hours[0]}</span>
          <span className="digital-digit">{hours[1]}</span>
          <span className="digital-separator">:</span>
          <span className="digital-digit">{minutes[0]}</span>
          <span className="digital-digit">{minutes[1]}</span>
          <span className="digital-separator">:</span>
          <span className="digital-digit">{seconds[0]}</span>
          <span className="digital-digit">{seconds[1]}</span>
        </div>
      </div>
    </div>
  )
}
