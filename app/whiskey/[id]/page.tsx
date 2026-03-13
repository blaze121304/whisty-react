"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getWhiskeyById, upsertWhiskey } from '@/lib/storage'
import { Whiskey } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { WhiskeyForm } from '@/components/whiskey-form'
import { motion } from 'framer-motion'

export default function WhiskeyDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [item, setItem] = useState<Whiskey | null>(null)
  const [imageError, setImageError] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    loadWhiskey()
  }, [params.id, router])

  const loadWhiskey = async () => {
    try {
      const w = await getWhiskeyById(params.id)
      if (!w) {
        router.replace('/')
      } else {
        setItem(w)
      }
    } catch (error) {
      console.error('Failed to load whiskey:', error)
      router.replace('/')
    }
  }

  if (!item) return null

  // 위스키 생산 지역 추론 함수
  const getWhiskeyRegion = (whiskey: Whiskey): string => {
    // 스코틀랜드 위스키가 아닌 경우
    if (whiskey.category !== 'Single Malt' && whiskey.category !== 'Blended') {
      return '-'
    }

    const brand = whiskey.brand.toLowerCase()
    const name = whiskey.name.toLowerCase()
    const englishName = (whiskey.englishName || '').toLowerCase()

    // Speyside (스페이사이드)
    if (brand.includes('glenlivet') || brand.includes('glenfiddich') || 
        brand.includes('macallan') || brand.includes('balvenie') ||
        brand.includes('glenmorangie') || brand.includes('glenfarclas') ||
        name.includes('글렌리벳') || name.includes('글렌피딕') || 
        name.includes('맥캘란') || name.includes('발베니') ||
        name.includes('글렌모렌지') || englishName.includes('glenlivet') ||
        englishName.includes('glenfiddich') || englishName.includes('macallan') ||
        englishName.includes('balvenie') || englishName.includes('glenmorangie')) {
      return 'Speyside'
    }

    // Islay (아일라)
    if (brand.includes('laphroaig') || brand.includes('lagavulin') || 
        brand.includes('ardbeg') || brand.includes('bowmore') ||
        brand.includes('bruichladdich') || brand.includes('caol ila') ||
        name.includes('라프로익') || name.includes('라가불린') || 
        name.includes('아드벡') || englishName.includes('laphroaig') ||
        englishName.includes('lagavulin') || englishName.includes('ardbeg')) {
      return 'Islay'
    }

    // Highland (하이랜드)
    if (brand.includes('highland park') || brand.includes('oban') || 
        brand.includes('dalmore') || brand.includes('glendronach') ||
        name.includes('하이랜드 파크') || name.includes('오반') ||
        englishName.includes('highland park') || englishName.includes('oban')) {
      return 'Highland'
    }

    // Islands (아일랜즈)
    if (brand.includes('talisker') || name.includes('탈리스커') ||
        englishName.includes('talisker')) {
      return 'Islands'
    }

    // Lowland (로우랜드)
    if (brand.includes('auchentoshan') || name.includes('아칸토션') ||
        englishName.includes('auchentoshan')) {
      return 'Lowland'
    }

    // Blended의 경우 일반적으로 여러 지역 혼합
    if (whiskey.category === 'Blended') {
      return 'Blended'
    }

    return 'Unknown'
  }

  const saveNotes = async () => {
    try {
      const next: Whiskey = { ...item, updatedAt: Date.now() }
      await upsertWhiskey(next)
      setIsEditMode(false)
      // 데이터 다시 로드
      await loadWhiskey()
    } catch (error) {
      console.error('Failed to save notes:', error)
      alert('저장에 실패했습니다.')
    }
  }

  const renderImage = () => {
    if (!item.imageDataUrl || imageError) {
      return <div className="w-full aspect-[3/4] bg-gradient-to-br from-amber-900/40 to-amber-700/20" />
    }

    const isExternalUrl = item.imageDataUrl.startsWith('http://') || item.imageDataUrl.startsWith('https://')

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.imageDataUrl}
        alt={item.name}
        className="main-image w-full object-cover"
        style={{ aspectRatio: '3/4' }}
        onError={() => setImageError(true)}
        {...(isExternalUrl && { crossOrigin: 'anonymous' })}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 - 클릭 시 닫기 */}
      <div 
        className="absolute inset-0 bg-black/40" 
        onClick={() => router.back()}
      />
      {/* 컨텐츠 */}
      <div className="absolute inset-0 flex items-center justify-center p-4 py-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="container max-w-7xl mx-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="detail-modal bento p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 좌측: 이미지 섹션 */}
              <motion.div 
                className="image-section"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="bento overflow-hidden relative rounded-xl mb-4 min-h-[calc(85.5%+1rem)]">
                  {renderImage()}
                  {/* 왼쪽 상단: 카테고리 태그 */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border border-white/10 shadow-sm bg-white/70 text-amber-900 backdrop-blur-sm dark:bg-black/50 dark:text-amber-100">
                      {item.category}
                    </span>
                  </div>
                  {/* 오른쪽 상단: 서브카테고리 태그 */}
                  {((item.subCategories && item.subCategories.length > 0) || item.subCategory) && (
                    <div className="absolute top-2 right-2 flex flex-wrap gap-1 justify-end max-w-[50%] z-10">
                      {(() => {
                        const subCats = item.subCategories && item.subCategories.length > 0 
                          ? item.subCategories 
                          : (item.subCategory ? [item.subCategory] : [])
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
                  )}
                </div>
                {/* 이미지 갤러리 (다각도 이미지 썸네일) */}
                <div className="image-gallery flex gap-2">
                  {/* 현재는 메인 이미지만 있으므로 같은 이미지를 썸네일로 표시 */}
                  <div 
                    className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 border-amber-600 opacity-100"
                    onClick={() => {}}
                  >
                    {item.imageDataUrl && !imageError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={item.imageDataUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-900/40 to-amber-700/20" />
                    )}
                  </div>
                  {/* 추가 이미지 슬롯 (향후 확장용) */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-dashed border-amber-900/20 dark:border-white/10 flex items-center justify-center">
                    <span className="text-xs text-amber-900/40 dark:text-white/40">+</span>
                  </div>
                </div>
              </motion.div>

              {/* 중앙: 상세 정보 */}
              <motion.div 
                className="info-section"
                initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="mb-6">
                  <div className="flex items-center justify-between gap-4 mb-2 h-[2.25rem]">
                    <h1 className="whiskey-name text-3xl font-bold text-foreground dark:text-foreground flex-1">{item.name}</h1>
                    {/* 별점 섹션 */}
                    {item.starPoint != null && (
                      <div className="rating-section flex items-center gap-1 flex-shrink-0">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const starValue = item.starPoint || 0
                          // 정수 부분보다 작거나 같으면 채워진 별
                          const isFullStar = star <= Math.floor(starValue)
                          
                          return (
                            <span 
                              key={star} 
                              className={`text-2xl ${
                                isFullStar 
                                  ? 'text-amber-400 dark:text-amber-500' 
                                  : 'text-amber-200 dark:text-amber-800'
                              }`}
                            >
                              {isFullStar ? '★' : '☆'}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <p className="subtitle text-sm text-amber-600 dark:text-amber-400 mb-4">
                    {item.englishName || item.brand} · {item.category}
                  </p>
                </div>
                
                <div className="details-grid grid grid-cols-2 gap-4 mb-6">
                  {item.abv && (
                    <div className="detail-item bento p-4">
                      <span className="label block text-xs text-amber-900/60 dark:text-white/60 mb-1">ABV</span>
                      <span className="value text-lg font-semibold text-foreground dark:text-foreground">{item.abv}%</span>
                    </div>
                  )}
                  {item.volume && (
                    <div className="detail-item bento p-4">
                      <span className="label block text-xs text-amber-900/60 dark:text-white/60 mb-1">Volume</span>
                      <span className="value text-lg font-semibold text-foreground dark:text-foreground">{item.volume}ml</span>
                    </div>
                  )}
                  <div className="detail-item bento p-4">
                    <span className="label block text-xs text-amber-900/60 dark:text-white/60 mb-1">Region</span>
                    <span className="value text-lg font-semibold text-foreground dark:text-foreground">
                      {item.region || getWhiskeyRegion(item)}
                    </span>
                  </div>
                  <div className="detail-item bento p-4">
                    <span className="label block text-xs text-amber-900/60 dark:text-white/60 mb-1">Nation</span>
                    <span className="value text-lg font-semibold text-foreground dark:text-foreground">
                      {item.nation || (item.category === 'Single Malt' || item.category === 'Blended' ? 'Scotland' : 
                       item.category === 'Grain/Bourbon/Rye' ? 'Various' : 
                       item.category === 'Gin & Vodka' ? 'Various' :
                       item.category === 'Wine & Liqueur' ? 'Various' :
                       item.category === 'Sake & Traditional' ? 'Japan/Korea' :
                       item.category === 'Beer & Soju' ? 'Various' : 'Unknown')}
                    </span>
                  </div>
                </div>
                
                {/* 개인 소감 */}
                <div className="mb-6">
                  <div className="bento p-4 min-h-[255px]">
                    <h3 className="text-sm font-semibold mb-4 text-foreground dark:text-foreground">My Story</h3>
                    {isEditMode ? (
                      <Textarea
                        value={item.personalNote || ''}
                        onChange={(e) => setItem({ ...item, personalNote: e.target.value })}
                        placeholder="이 위스키에 대한 개인적인 소감이나 추억을 적어보세요"
                        className="min-h-[120px] text-sm"
                      />
                    ) : (
                      <div className="story-details">
                        <p className="text-sm text-amber-900/70 dark:text-white/70 leading-relaxed">
                          {item.personalNote || '개인 소감을 입력해주세요'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* 우측: 테이스팅 & 액션 */}
              <motion.div 
                className="tasting-section"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="tasting-notes mb-6">
                  <h3 className="whiskey-name text-3xl font-bold mb-2 text-foreground dark:text-foreground h-[2.25rem] flex items-center">Tasting Profile</h3>
                  
                  {/* Flavor Tags */}
                  {isEditMode ? (
                    <div className="mb-4 space-y-2">
                      {(item.flavorTags && item.flavorTags.length > 0 ? item.flavorTags : ['스모키', '바닐라', '꿀', '캐러멜']).map((tag, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            type="text"
                            value={tag}
                            onChange={(e) => {
                              const next = [...(item.flavorTags && item.flavorTags.length > 0 ? item.flavorTags : ['스모키', '바닐라', '꿀', '캐러멜'])]
                              next[idx] = e.target.value
                              setItem({ ...item, flavorTags: next })
                            }}
                            placeholder="태그"
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const base = item.flavorTags && item.flavorTags.length > 0 ? item.flavorTags : ['스모키', '바닐라', '꿀', '캐러멜']
                              const next = base.filter((_, i) => i !== idx)
                              setItem({ ...item, flavorTags: next })
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            삭제
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const base = item.flavorTags && item.flavorTags.length > 0 ? item.flavorTags : []
                          setItem({ ...item, flavorTags: [...base, ''] })
                        }}
                        className="w-full"
                      >
                        + 태그 추가
                      </Button>
                    </div>
                  ) : (
                    <div className="flavor-tags flex flex-wrap gap-2 mb-4">
                      {(item.flavorTags && item.flavorTags.length > 0 ? item.flavorTags : ['스모키', '바닐라', '꿀', '캐러멜']).map((tag, idx) => (
                        <span key={idx} className="tag inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-amber-100/50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 border border-amber-300/50 dark:border-amber-700/50">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Notes Detail */}
                  <div className="notes-detail space-y-4 mb-6">
                    <div className="note-item bento p-4">
                      <h4 className="text-sm font-semibold mb-2 text-foreground dark:text-foreground flex items-center gap-2">
                        <span>👃</span> Nose
                      </h4>
                      {isEditMode ? (
                        <Textarea
                          value={item.nose || ''}
                          onChange={(e) => setItem({ ...item, nose: e.target.value })}
                          placeholder="향을 입력하세요"
                          className="min-h-[60px] text-sm"
                        />
                      ) : (
                        <p className="text-sm text-amber-900/70 dark:text-white/70 leading-relaxed">
                          {item.nose || (item.notes ? item.notes.split('\n')[0] : '') || '풍부한 과일향과 은은한 스모키함'}
                        </p>
          )}
        </div>
                    <div className="note-item bento p-4">
                      <h4 className="text-sm font-semibold mb-2 text-foreground dark:text-foreground flex items-center gap-2">
                        <span>👅</span> Palate
                      </h4>
                      {isEditMode ? (
                        <Textarea
                          value={item.palate || ''}
                          onChange={(e) => setItem({ ...item, palate: e.target.value })}
                          placeholder="맛을 입력하세요"
                          className="min-h-[60px] text-sm"
                        />
                      ) : (
                        <p className="text-sm text-amber-900/70 dark:text-white/70 leading-relaxed">
                          {item.palate || (item.notes ? item.notes.split('\n')[1] : '') || '부드러운 바닐라와 캐러멜의 조화'}
                        </p>
                      )}
          </div>
                    <div className="note-item bento p-4">
                      <h4 className="text-sm font-semibold mb-2 text-foreground dark:text-foreground flex items-center gap-2">
                        <span>🌟</span> Finish
                      </h4>
                      {isEditMode ? (
            <Textarea
                          value={item.finish || ''}
                          onChange={(e) => setItem({ ...item, finish: e.target.value })}
                          placeholder="여운을 입력하세요"
                          className="min-h-[60px] text-sm"
                        />
                      ) : (
                        <p className="text-sm text-amber-900/70 dark:text-white/70 leading-relaxed">
                          {item.finish || (item.notes ? item.notes.split('\n')[2] : '') || '길고 따뜻한 여운'}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* 페어링 추천 섹션 */}
                  <div className="pairing-section mb-6">
                    <div className="bento p-4">
                      <h3 className="text-sm font-semibold mb-4 text-foreground dark:text-foreground">Perfect Pairings</h3>
                      {isEditMode ? (
                        <div className="space-y-3">
                          {(item.pairings && item.pairings.length > 0 ? item.pairings : [
                            { icon: '🧀', name: 'Aged Cheddar' },
                            { icon: '🍫', name: 'Dark Chocolate' },
                            { icon: '🥩', name: 'Grilled Steak' }
                          ]).map((pairing, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={pairing.icon}
                                onChange={(e) => {
                                  const newPairings = [...(item.pairings || [
                                    { icon: '🧀', name: 'Aged Cheddar' },
                                    { icon: '🍫', name: 'Dark Chocolate' },
                                    { icon: '🥩', name: 'Grilled Steak' }
                                  ])]
                                  newPairings[index] = { ...newPairings[index], icon: e.target.value }
                                  setItem({ ...item, pairings: newPairings })
                                }}
                                placeholder="이모지"
                                className="w-20 text-center"
                              />
                              <Input
                                type="text"
                                value={pairing.name}
                                onChange={(e) => {
                                  const newPairings = [...(item.pairings || [
                                    { icon: '🧀', name: 'Aged Cheddar' },
                                    { icon: '🍫', name: 'Dark Chocolate' },
                                    { icon: '🥩', name: 'Grilled Steak' }
                                  ])]
                                  newPairings[index] = { ...newPairings[index], name: e.target.value }
                                  setItem({ ...item, pairings: newPairings })
                                }}
                                placeholder="페어링 이름"
                                className="flex-1"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newPairings = [...(item.pairings || [
                                    { icon: '🧀', name: 'Aged Cheddar' },
                                    { icon: '🍫', name: 'Dark Chocolate' },
                                    { icon: '🥩', name: 'Grilled Steak' }
                                  ])]
                                  newPairings.splice(index, 1)
                                  setItem({ ...item, pairings: newPairings.length > 0 ? newPairings : undefined })
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                삭제
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newPairings = [...(item.pairings || [
                                { icon: '🧀', name: 'Aged Cheddar' },
                                { icon: '🍫', name: 'Dark Chocolate' },
                                { icon: '🥩', name: 'Grilled Steak' }
                              ]), { icon: '🍽️', name: '' }]
                              setItem({ ...item, pairings: newPairings })
                            }}
                            className="w-full mt-2"
                          >
                            + 페어링 추가
                          </Button>
                        </div>
                      ) : (
                        <div className="pairing-grid grid grid-cols-3 gap-3">
                          {(item.pairings && item.pairings.length > 0 ? item.pairings : [
                            { icon: '🧀', name: 'Aged Cheddar' },
                            { icon: '🍫', name: 'Dark Chocolate' },
                            { icon: '🥩', name: 'Grilled Steak' }
                          ]).map((pairing, index) => (
                            <div key={index} className="pairing-item bento p-3 text-center">
                              <span className="icon text-2xl block mb-1">{pairing.icon}</span>
                              <p className="text-xs text-amber-900/70 dark:text-white/70">{pairing.name}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="action-buttons flex flex-col gap-2">
                  {isEditMode ? (
                    <>
                      <Button onClick={saveNotes} className="action-button w-full">저장</Button>
                      <Button variant="outline" onClick={async () => {
                        setIsEditMode(false)
                        // 변경사항 취소 - 원본 데이터 다시 로드
                        await loadWhiskey()
                      }} className="w-full">취소</Button>
                    </>
                  ) : (
                    <Button variant="outline" onClick={() => setIsEditMode(true)} className="w-full">수정</Button>
                  )}
                </div>
              </motion.div>
          </div>
          </div>

      <WhiskeyForm
        open={isEditFormOpen}
        onOpenChange={setIsEditFormOpen}
        editingItem={item}
        onSaved={async (list) => {
          await loadWhiskey()
        }}
      />
        </motion.div>
      </div>
    </div>
  )
}



