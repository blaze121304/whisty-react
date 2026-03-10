"use client"
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Whiskey, WhiskeyCategory, WhiskeySubCategory } from '@/lib/types'
import { upsertWhiskey } from '@/lib/storage'

const categories: WhiskeyCategory[] = ['Single Malt', 'Blended Malt', 'World Whiskey', 'Gin & Vodka', 'Wine & Liqueur', 'Sake & Traditional', 'Beer']

const categoryLabels: Record<WhiskeyCategory, string> = {
  'Single Malt': '싱글몰트',
  'Blended Malt': '블렌디드',
  'World Whiskey': '월드위스키',
  'Gin & Vodka': '진&보드카',
  'Wine & Liqueur': '와인&리큐어',
  'Sake & Traditional': '사케/전통주',
  'Beer': '맥주',
}

export function WhiskeyForm({ 
  open, 
  onOpenChange, 
  onSaved,
  editingItem 
}: { 
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved: (list: Whiskey[]) => void
  editingItem?: Whiskey | null
}) {
  const [name, setName] = useState('')
  const [englishName, setEnglishName] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState<WhiskeyCategory | ''>('')
  const [subCategories, setSubCategories] = useState<WhiskeySubCategory[]>([])
  const [abv, setAbv] = useState<string>('')
  const [volume, setVolume] = useState<string>('')
  const [nation, setNation] = useState<string>('')
  const [region, setRegion] = useState<string>('')
  const [starPoint, setStarPoint] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(undefined)
  const [imageFile, setImageFile] = useState<File | undefined>(undefined)
  const [isDragging, setIsDragging] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const inputFileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (open && editingItem) {
      // 수정 모드: 기존 정보로 폼 채우기
      setName(editingItem.name || '')
      setEnglishName(editingItem.englishName || '')
      setBrand(editingItem.brand || '')
      setCategory(editingItem.category || '')
      setNotes(editingItem.notes || '')
      setImageDataUrl(editingItem.imageDataUrl)
      setAbv(editingItem.abv ? String(editingItem.abv) : '')
      setVolume(editingItem.volume ? String(editingItem.volume) : '')
      setNation(editingItem.nation || '')
      setRegion(editingItem.region || '')
      setStarPoint(editingItem.starPoint ? String(editingItem.starPoint) : '')
      // subCategories 또는 subCategory (하위 호환성)에서 가져오기
      if (editingItem.subCategories && editingItem.subCategories.length > 0) {
        setSubCategories([...editingItem.subCategories])
      } else if (editingItem.subCategory) {
        setSubCategories([editingItem.subCategory])
      } else {
        setSubCategories([])
      }
    } else if (!open) {
      // 폼 닫을 때 초기화
      setName('')
      setEnglishName('')
      setBrand('')
      setCategory('')
      setSubCategories([])
      setAbv('')
      setVolume('')
      setNation('')
      setRegion('')
      setStarPoint('')
      setNotes('')
      setImageDataUrl(undefined)
      setImageFile(undefined)
    }
  }, [open, editingItem])

  const handleFileSelect = async (file: File | null) => {
    if (!file) return
    try {
      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('이미지 파일 크기는 5MB 이하여야 합니다.')
      }
      // 이미지 파일만 허용
      if (!file.type.startsWith('image/')) {
        throw new Error('이미지 파일만 업로드 가능합니다.')
      }
      // 파일 저장 (API 호출 시 사용)
      setImageFile(file)
      // 미리보기를 위한 DataURL 생성
      const reader = new FileReader()
      reader.onload = () => {
        setImageDataUrl(String(reader.result))
      }
      reader.readAsDataURL(file)
    } catch (error) {
      const message = error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.'
      alert(message)
      console.error(error)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file!)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const onSubmit = async () => {
    if (!name.trim()) {
      alert('위스키명을 입력해주세요.')
      return
    }
    if (!category) {
      alert('종류를 선택해주세요.')
      return
    }
    
    setIsSaving(true)
    try {
      const now = Date.now()
      const whiskeyData: Partial<Whiskey> = {
        name,
        englishName: englishName || undefined,
        brand,
        category: category as WhiskeyCategory,
        subCategories: subCategories.length > 0 ? subCategories : undefined,
        abv: abv ? parseFloat(abv) : undefined,
        volume: volume ? parseFloat(volume) : undefined,
        nation: nation || undefined,
        region: region || undefined,
        starPoint: starPoint ? parseFloat(starPoint) : undefined,
        notes: notes || undefined,
      }

      if (editingItem) {
        // 수정 모드
        whiskeyData.id = editingItem.id
        whiskeyData.createdAt = editingItem.createdAt
        whiskeyData.updatedAt = now
        // 이미지가 변경되지 않았으면 기존 URL 유지
        if (!imageFile && editingItem.imageDataUrl) {
          whiskeyData.imageDataUrl = editingItem.imageDataUrl
        }
      } else {
        // 등록 모드
        whiskeyData.createdAt = now
        whiskeyData.updatedAt = now
      }

      const list = await upsertWhiskey(whiskeyData as Whiskey, imageFile)
      onSaved(list)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save whiskey:', error)
      alert('위스키 저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={"fixed inset-0 z-50 transition " + (open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}>
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="absolute bottom-0 left-0 right-0 md:left-auto md:right-6 md:bottom-6 md:w-[520px]">
        <div className="bento p-5 md:p-6 md:rounded-2xl md:shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{editingItem ? '수정' : '등록'}</h3>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>닫기</Button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <Label>위스키명</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="더 맥캘란 12" />
            </div>
            <div>
              <Label>영문명</Label>
              <Input value={englishName} onChange={(e) => setEnglishName(e.target.value)} placeholder="The Macallan 12" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>브랜드</Label>
                <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Macallan" />
              </div>
              <div>
                <Label>종류 <span className="text-red-400">*</span></Label>
                <Select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value as WhiskeyCategory | '')
                    // 셰리/피트/버번 서브 특성을 사용하는 카테고리만 유지 (싱글몰트, 월드위스키)
                    const cat = e.target.value as WhiskeyCategory | ''
                    if (cat !== 'Single Malt' && cat !== 'World Whiskey') {
                      setSubCategories([])
                    }
                  }}
                >
                  <option value="">선택해주세요</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{categoryLabels[c]}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ABV (%)</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  value={abv} 
                  onChange={(e) => setAbv(e.target.value)} 
                  placeholder="40.0" 
                />
              </div>
              <div>
                <Label>용량 (ml)</Label>
                <Input 
                  type="number" 
                  step="1"
                  value={volume} 
                  onChange={(e) => setVolume(e.target.value)} 
                  placeholder="700" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>국가</Label>
                <Input 
                  value={nation} 
                  onChange={(e) => setNation(e.target.value)} 
                  placeholder="스코틀랜드" 
                />
              </div>
              <div>
                <Label>생산지역</Label>
                <Input 
                  value={region} 
                  onChange={(e) => setRegion(e.target.value)} 
                  placeholder="스페이사이드" 
                />
              </div>
            </div>
            <div>
              <Label>별점</Label>
              <Input 
                type="number" 
                step="0.1"
                min="0"
                max="5"
                value={starPoint} 
                onChange={(e) => setStarPoint(e.target.value)} 
                placeholder="4.5" 
              />
            </div>
            {/* 셰리/피트/버번 체크박스 - 블렌디드를 제외한 위스키 카테고리(싱글몰트, 월드위스키)에서만 표시 */}
            {(category === 'Single Malt' || category === 'World Whiskey') && (
              <div>
                <Label>특성 (선택)</Label>
                <div className="mt-2 flex flex-wrap gap-4">
                  {(['Sherry', 'Peat', 'Bourbon'] as WhiskeySubCategory[]).map((subCat) => (
                    <label key={subCat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subCategories.includes(subCat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSubCategories([...subCategories, subCat])
                          } else {
                            setSubCategories(subCategories.filter((sc) => sc !== subCat))
                          }
                        }}
                        className="w-4 h-4 rounded border-amber-900/20 dark:border-white/20 text-amber-600 focus:ring-amber-500 focus:ring-2"
                      />
                      <span className="text-sm text-foreground dark:text-foreground">
                        {subCat === 'Sherry' ? '셰리' : subCat === 'Peat' ? '피트' : subCat === 'Bourbon' ? '버번' : subCat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Label>사진</Label>
              <div
                className={`
                  mt-2 border-2 border-dashed rounded-xl p-6 transition-colors
                  ${isDragging 
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/20' 
                    : 'border-amber-900/20 dark:border-white/10 hover:border-amber-600/50 dark:hover:border-amber-600/50'
                  }
                  ${imageDataUrl ? 'border-amber-600 dark:border-amber-600' : ''}
                `}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  ref={inputFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    handleFileSelect(file!)
                  }}
                />
                {imageDataUrl ? (
                  <div className="space-y-3">
                    <div className="relative w-full rounded-lg overflow-hidden" style={{ aspectRatio: '3/4', maxHeight: '300px' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={imageDataUrl} 
                        alt="preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImageDataUrl(undefined)
                          setImageFile(undefined)
                          if (inputFileRef.current) {
                            inputFileRef.current.value = ''
                          }
                        }}
                      >
                        이미지 제거
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => inputFileRef.current?.click()}
                      >
                        이미지 변경
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="text-center space-y-3 cursor-pointer"
                    onClick={() => inputFileRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-amber-600 dark:text-amber-400"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                      </svg>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground dark:text-foreground">
                          이미지를 드래그하거나 클릭하여 업로드
                        </p>
                        <p className="text-xs text-amber-900/60 dark:text-white/60">
                          PNG, JPG, GIF (최대 5MB)
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        inputFileRef.current?.click()
                      }}
                    >
                      파일 선택
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>취소</Button>
              <Button onClick={onSubmit} disabled={isSaving}>
                {isSaving ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



