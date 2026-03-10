"use client"
import { ThemeToggle } from '@/components/theme-toggle'
import { useEffect, useState, useId } from 'react'
import { Input } from '@/components/ui/input'
import { SettingsMenu } from '@/components/settings-menu'
import { CalendarPopup } from '@/components/calendar-popup'
import { Button } from '@/components/ui/button'
import { DateTimeDisplay } from '@/components/date-time-display'

export function Header({ 
  onRegister, 
  onDelete, 
  onEdit,
  nameSearch, 
  onNameSearchChange 
}: { 
  onRegister: () => void
  onDelete: () => void
  onEdit: () => void
  nameSearch: string
  onNameSearchChange: (v: string) => void
}) {
  const [quote, setQuote] = useState<string>("오늘도 한 잔의 여유를.")
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const calendarGradientId = useId()

  // 명언 API는 유지하되, 현재 화면에는 노출하지 않으므로 호출은 생략

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-1' : 'py-2'}`}>
        <div className="container mx-auto px-4 md:px-6">
          {/* 헤더 바 - 반투명 유리 카드 */}
          <div className="header-glass-bar rounded-xl px-3 md:px-5 py-2 md:py-2.5">
            <div className="w-full flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
              {/* 왼쪽: 시계 (약간 좁게 조정) */}
              <div className="flex-shrink-0 w-28 md:w-40">
                <div className="w-full">
                  <DateTimeDisplay />
                </div>
              </div>

              {/* 가운데: 검색창 (가능한 넓게) */}
              <div className="flex-1 min-w-0">
                <Input
                  value={nameSearch}
                  onChange={(e) => onNameSearchChange(e.target.value)}
                  placeholder="이름/브랜드 검색 — Macallan, Lagavulin, Yamazaki…"
                  className="w-full font-inter h-8 md:h-9 text-xs md:text-sm placeholder:text-amber-900/40 dark:placeholder:text-amber-200/40"
                />
              </div>

              {/* 오른쪽: 캘린더 / 설정 */}
              <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                {/* 캘린더 버튼 */}
                <Button
                  variant="ghost"
                  onClick={() => setIsCalendarOpen(true)}
                  className="bar-icon-button h-8 w-8 md:h-9 md:w-9 p-0 flex items-center justify-center"
                  aria-label="캘린더"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={`url(#${calendarGradientId})`}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <defs>
                      <linearGradient id={calendarGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#C8893E" stopOpacity="1" />
                        <stop offset="50%" stopColor="#D4A574" stopOpacity="1" />
                        <stop offset="100%" stopColor="#B87A2E" stopOpacity="1" />
                      </linearGradient>
                    </defs>
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                    <line x1="16" x2="16" y1="2" y2="6"/>
                    <line x1="8" x2="8" y1="2" y2="6"/>
                    <line x1="3" x2="21" y1="10" y2="10"/>
                  </svg>
                </Button>
                {/* 설정 메뉴 */}
                <SettingsMenu 
                  onRegister={onRegister}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
                <div className="flex-shrink-0 hidden">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* 헤더 높이만큼 여백 추가 */}
      <div className={`transition-all duration-300 ${isScrolled ? 'h-16 md:h-18' : 'h-20 md:h-24'}`} />

      {/* 히어로 섹션 */}
      <div className="w-full">
        <div className="container mx-auto px-4 md:px-6 pb-4">
          <div
            className="hero-bar-section relative w-full h-36 md:h-48 rounded-2xl overflow-hidden border border-amber-900/20 dark:border-amber-900/30"
            style={{
              backgroundImage: "url('/hero/whiskey-bar.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* 암버 그라데이션 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-900/10 to-[#0A0A0A]/70" />
            {/* 필름 그레인 */}
            <div className="absolute inset-0 hero-grain opacity-20" />
            
            {/* 명언 텍스트 영역 제거: 배경만 보이도록 유지 */}
          </div>
        </div>
      </div>

      <CalendarPopup open={isCalendarOpen} onOpenChange={setIsCalendarOpen} />
    </>
  )
}



