"use client"
import Link from 'next/link'
import { Whiskey } from '@/lib/types'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useState } from 'react'

export function BentoGrid({ items }: { items: Whiskey[] }) {
  if (items.length === 0) {
    return (
      <div className="bento p-8 text-center text-amber-900/70 dark:text-white/70">
        아직 등록된 위스키가 없습니다. 상단의 "위스키 등록" 버튼을 눌러 추가하세요.
      </div>
    )
  }
  return (
    <div className="[column-fill:_balance] columns-2 md:columns-3 lg:columns-5 gap-4 space-y-4">
      {items.map((w) => {
        const ImageComponent = ({ imageUrl }: { imageUrl: string }) => {
          const [imageError, setImageError] = useState(false)
          const isExternalUrl = imageUrl.startsWith('http://') || imageUrl.startsWith('https://')
          
          if (imageError) {
            return <div className="w-full aspect-[3/4] bg-gradient-to-br from-amber-900/40 to-amber-700/20" />
          }

          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={w.name}
              className="w-full object-cover"
              style={{ aspectRatio: '3/4' }}
              onError={() => setImageError(true)}
              {...(isExternalUrl && { crossOrigin: 'anonymous' })}
            />
          )
        }

        // 카테고리에 따른 텍스처 클래스 결정
        const getTextureClass = (category: string) => {
          if (category === 'Single Malt') return 'whiskey-card-linen'
          if (category === 'Grain/Bourbon/Rye') return 'whiskey-card-felt'
          if (category === 'Blended') return 'whiskey-card-linen'
          return 'whiskey-card-default'
        }

        return (
          <motion.div key={w.id} layoutId={`card-${w.id}`} className="break-inside-avoid group">
            <Link href={`/whiskey/${w.id}`}>
              <Card className={`whiskey-card ${getTextureClass(w.category)} p-0 overflow-hidden rounded-xl relative`}>
                {/* 구리 호일 라인 */}
                <div className="copper-foil-line-card" />
                <div className="relative">
                  {w.imageDataUrl ? (
                    <ImageComponent imageUrl={w.imageDataUrl} />
                  ) : (
                    <div className="w-full aspect-[3/4] bg-gradient-to-br from-amber-900/40 to-amber-700/20" />
                  )}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border border-white/10 shadow-sm bg-white/70 text-amber-900 backdrop-blur-sm dark:bg-black/50 dark:text-amber-100">
                      {w.category}
                    </span>
                  </div>
                  {/* 호버 오버레이 */}
                  <div className="card-overlay absolute inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                    {w.personalNote && (
                      <div className="tasting-notes text-white space-y-1.5 pt-12">
                        <p className="text-xs leading-relaxed break-words">{w.personalNote}</p>
                      </div>
                    )}
                    {!w.personalNote && (
                      <div className="tasting-notes text-white/70 text-xs pt-12">
                        My Story가 없습니다
                      </div>
                    )}
                    <div className="quick-actions flex flex-col gap-2">
                      <Link 
                        href={`/whiskey/${w.id}`}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        상세 보기
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  {(w.subCategories && w.subCategories.length > 0) || w.subCategory ? (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {(() => {
                        const subCats = w.subCategories && w.subCategories.length > 0 
                          ? w.subCategories 
                          : (w.subCategory ? [w.subCategory] : [])
                        return subCats.map((subCat, idx) => (
                          <span
                            key={idx}
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border border-white/10 shadow-sm backdrop-blur-sm ${
                              subCat === 'Sherry'
                                ? 'bg-[#800020]/70 text-white dark:bg-[#800020]/50'
                                : subCat === 'Peat'
                                ? 'bg-[#3D2817]/70 text-white dark:bg-[#3D2817]/50'
                                : subCat === 'Bourbon'
                                ? 'bg-[#FFD700]/70 text-amber-900 dark:bg-[#FFD700]/50 dark:text-amber-900'
                                : subCat === 'Wine/Port'
                                ? 'bg-[#722F37]/70 text-white dark:bg-[#722F37]/50'
                                : ''
                            }`}
                          >
                            {subCat === 'Sherry' ? '셰리' : subCat === 'Peat' ? '피트' : subCat === 'Bourbon' ? '버번' : subCat === 'Wine/Port' ? '와인/포트' : subCat}
                          </span>
                        ))
                      })()}
                    </div>
                  ) : null}
                  <div className="whiskey-brand text-sm whitespace-normal break-words">{w.brand}</div>
                  <div className="whiskey-name mt-1 text-foreground dark:text-foreground whitespace-normal break-words">{w.name}</div>
                  {w.englishName && (
                    <div className="mt-0.5 text-xs text-amber-900/60 dark:text-white/50 whitespace-normal break-words">{w.englishName}</div>
                  )}
                  {(w.abv != null || w.volume != null) && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-amber-900/70 dark:text-white/60">
                      {w.abv != null && (
                        <span className="inline-flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                          </svg>
                          {w.abv}%
                        </span>
                      )}
                      {w.abv != null && w.volume != null && (
                        <span className="text-amber-900/40 dark:text-white/40">·</span>
                      )}
                      {w.volume != null && (
                        <span className="inline-flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2h12v20H6z"/>
                            <path d="M6 8h12"/>
                          </svg>
                          {w.volume}ml
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}



