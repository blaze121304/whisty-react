"use client"
import { Button } from '@/components/ui/button'
import type { WhiskeyCategory, WhiskeySubCategory } from '@/lib/types'
import { useState } from 'react'

const whiskeyCategories: Array<{ value: WhiskeyCategory | 'whiskey-all'; label: string }> = [
  { value: 'whiskey-all', label: '전체' },
  { value: 'Single Malt', label: '싱글몰트' },
  { value: 'Blended', label: '블렌디드' },
  { value: 'Grain/Bourbon/Rye', label: '그레인/버번/라이' },
]

const spiritCategories: Array<{ value: WhiskeyCategory | 'spirit-all'; label: string }> = [
  { value: 'spirit-all', label: '전체' },
  { value: 'Gin & Vodka', label: '진/보드카' },
  { value: 'Wine & Liqueur', label: '와인/리큐어' },
  { value: 'Sake & Traditional', label: '사케/전통주' },
  { value: 'Beer & Soju', label: '맥주/소주' },
]

const whiskeySubCategories: Array<{ value: WhiskeySubCategory; label: string }> = [
  { value: 'Sherry', label: '셰리 캐스크' },
  { value: 'Bourbon', label: '버번 캐스크' },
  { value: 'Wine/Port', label: '와인/포트' },
  { value: 'Peat', label: '피트' },
]

export function CategorySidebar({
  selected,
  onSelect,
  subCategory,
  onSubCategorySelect,
}: {
  selected: 'all' | WhiskeyCategory | 'whiskey-all' | 'spirit-all'
  onSelect: (v: 'all' | WhiskeyCategory | 'whiskey-all' | 'spirit-all') => void
  subCategory?: WhiskeySubCategory | 'all'
  onSubCategorySelect?: (v: WhiskeySubCategory | 'all' | undefined) => void
}) {
  const isWhiskeyCategory = (cat: WhiskeyCategory): boolean => {
    // 셰리/버번/와인포트/피트 특성을 사용하는 메인 카테고리는 싱글몰트만
    return cat === 'Single Malt'
  }

  const isSpiritCategory = (cat: WhiskeyCategory): boolean => {
    return cat === 'Gin & Vodka' || cat === 'Wine & Liqueur' || cat === 'Sake & Traditional' || cat === 'Beer & Soju'
  }

  const isSelected = (value: string) => {
    if (value === 'whiskey-all') {
      // 위스키 그룹 전체가 명시적으로 선택된 경우만 true
      return selected === 'whiskey-all'
    }
    if (value === 'spirit-all') {
      // 스피릿 그룹 전체가 명시적으로 선택된 경우만 true
      return selected === 'spirit-all'
    }
    // 개별 카테고리는 정확히 일치할 때만 선택
    return selected === value
  }

  const handleSelect = (value: string) => {
    if (value === 'whiskey-all' || value === 'spirit-all') {
      onSelect(value as 'whiskey-all' | 'spirit-all')
    } else {
      onSelect(value as WhiskeyCategory)
    }
  }

  const isWhiskeyCategorySelected = (cat: WhiskeyCategory): boolean => {
    // 셰리/버번/와인포트/피트 특성을 사용하는 메인 카테고리는 싱글몰트만
    return cat === 'Single Malt'
  }

  return (
    <div className="bento p-4">
      <div className="text-sm font-semibold mb-4 text-amber-900/90 dark:text-amber-200/90 uppercase tracking-wider">Category</div>
      
      {/* 위스키 그룹 */}
      <div className="mb-6">
        <div className="text-xs font-semibold mb-2 text-amber-900/80 dark:text-amber-200/80 uppercase tracking-wider">위스키</div>
        <div className="space-y-2">
          {whiskeyCategories.map((cat) => {
            const isCurrentCategorySelected = cat.value !== 'whiskey-all' && cat.value === selected
            const showSubCategories = isCurrentCategorySelected && isWhiskeyCategorySelected(cat.value as WhiskeyCategory) && onSubCategorySelect
            
            return (
              <div key={cat.value}>
                <Button
                  variant={isSelected(cat.value) ? 'default' : 'ghost'}
                  onClick={() => {
                    handleSelect(cat.value)
                    // 위스키 카테고리가 아닌 다른 카테고리 선택 시 서브카테고리 초기화
                    if (!isWhiskeyCategorySelected(cat.value as WhiskeyCategory) && onSubCategorySelect) {
                      onSubCategorySelect(undefined)
                    }
                  }}
                  className={`w-full justify-start ${isSelected(cat.value) ? 'filter-selected' : ''}`}
                  size="sm"
                >
                  {cat.label}
                </Button>
                
                {/* 위스키 상세 검색 - 위스키 카테고리 버튼 바로 아래에 표시 */}
                {showSubCategories && (
                  <div className="mt-2 ml-4 pl-4 border-l-2 border-amber-900/30 dark:border-amber-700/40">
                    <div className="space-y-1.5">
                      {whiskeySubCategories.map((subCat) => (
                        <Button
                          key={subCat.value}
                          variant={subCategory === subCat.value ? 'default' : 'ghost'}
                          onClick={() => {
                            // 같은 항목을 다시 클릭하면 선택 해제 (전체로)
                            if (subCategory === subCat.value) {
                              onSubCategorySelect(undefined)
                            } else {
                              onSubCategorySelect(subCat.value)
                            }
                          }}
                          className={`w-full justify-start text-xs ${subCategory === subCat.value ? 'filter-selected' : ''}`}
                          size="sm"
                        >
                          {subCat.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 스피릿/기타 그룹 */}
      <div>
        <div className="text-xs font-semibold mb-2 text-amber-900/80 dark:text-amber-200/80 uppercase tracking-wider">스피릿 / 기타</div>
        <div className="space-y-2">
          {spiritCategories.map((cat) => (
            <Button
              key={cat.value}
              variant={isSelected(cat.value) ? 'default' : 'ghost'}
              onClick={() => {
                handleSelect(cat.value)
                // 스피릿 카테고리 선택 시 서브카테고리 초기화
                if (onSubCategorySelect) {
                  onSubCategorySelect(undefined)
                }
              }}
              className={`w-full justify-start ${isSelected(cat.value) ? 'filter-selected' : ''}`}
              size="sm"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

