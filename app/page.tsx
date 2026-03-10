"use client"
import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { CategorySidebar } from '@/components/category-sidebar'
import { BentoGrid } from '@/components/bento-grid'
import { MusicPlayer } from '@/components/music-player'
import { useEffect, useMemo, useState } from 'react'
import { Whiskey, WhiskeySubCategory, WhiskeyCategory } from '@/lib/types'
import { WhiskeyForm } from '@/components/whiskey-form'
import { WhiskeySelectModal } from '@/components/whiskey-select-modal'
import { getAllWhiskeys, deleteWhiskey } from '@/lib/storage'

export default function HomePage() {
  const [whiskeys, setWhiskeys] = useState<Whiskey[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<'all' | WhiskeyCategory | 'whiskey-all' | 'spirit-all'>('all')
  const [subCategoryFilter, setSubCategoryFilter] = useState<'all' | 'Sherry' | 'Peat' | 'Bourbon' | undefined>(undefined)
  const [nameSearch, setNameSearch] = useState<string>('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingWhiskey, setEditingWhiskey] = useState<Whiskey | null>(null)

  useEffect(() => {
    loadWhiskeys()
  }, [])

  const loadWhiskeys = async () => {
    try {
      setLoading(true)
      const data = await getAllWhiskeys()
      setWhiskeys(data)
    } catch (error) {
      console.error('Failed to load whiskeys:', error)
      alert('위스키 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return whiskeys.filter((w) => {
      let inType = true
      
      if (typeFilter === 'all') {
        inType = true
      } else if (typeFilter === 'whiskey-all') {
        // 위스키 그룹 전체
        inType = w.category === 'Single Malt' || w.category === 'Blended Malt' || w.category === 'World Whiskey'
      } else if (typeFilter === 'spirit-all') {
        // 스피릿/기타 그룹 전체
        inType = w.category === 'Gin & Vodka' || w.category === 'Wine & Liqueur' || w.category === 'Sake & Traditional' || w.category === 'Beer'
      } else {
        // 개별 카테고리
        inType = w.category === typeFilter
      }
      
      // 위스키 상세 검색 필터링 (싱글몰트, 월드위스키) - 블렌디드는 셰리/피트/버번 구분 없음
      if ((typeFilter === 'Single Malt' || typeFilter === 'World Whiskey') && subCategoryFilter && subCategoryFilter !== 'all') {
        // subCategories 배열 또는 subCategory (하위 호환성)에서 체크
        const subCats = w.subCategories && w.subCategories.length > 0 
          ? w.subCategories 
          : (w.subCategory ? [w.subCategory] : [])
        inType = inType && subCats.includes(subCategoryFilter as WhiskeySubCategory)
      }
      
      const inName = nameSearch.trim() === '' 
        ? true 
        : w.name.toLowerCase().includes(nameSearch.toLowerCase()) || 
          w.brand.toLowerCase().includes(nameSearch.toLowerCase())
      return inType && inName
    })
  }, [whiskeys, typeFilter, subCategoryFilter, nameSearch])

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen"
    >
      <Header 
        onRegister={() => setIsFormOpen(true)} 
        onDelete={() => {
          setIsDeleteModalOpen(true)
        }}
        onEdit={() => {
          setIsSelectModalOpen(true)
        }}
        nameSearch={nameSearch} 
        onNameSearchChange={setNameSearch} 
      />
      <div className="container mx-auto px-4 pt-4 pb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 왼쪽 사이드바 - 종류 필터 */}
          <aside className="w-full md:w-48 flex-shrink-0">
            <CategorySidebar
              selected={typeFilter}
              onSelect={setTypeFilter}
              subCategory={subCategoryFilter}
              onSubCategorySelect={setSubCategoryFilter}
            />
            {/* 음악 플레이어 - 사이드바 아래에 컴팩트 버전 */}
            <div className="mt-6">
              <MusicPlayer />
            </div>
          </aside>

          {/* 메인 컨텐츠 영역 */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              {loading ? (
                <div className="bento p-8 text-center text-amber-900/70 dark:text-white/70">
                  로딩 중...
                </div>
              ) : (
                <BentoGrid items={filtered} />
              )}
            </div>
          </div>
        </div>
      </div>

      <WhiskeyForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSaved={async (list) => {
          setWhiskeys(list)
          await loadWhiskeys()
        }}
      />

      <WhiskeySelectModal
        open={isSelectModalOpen}
        onOpenChange={setIsSelectModalOpen}
        whiskeys={whiskeys}
        onSelect={(whiskey) => {
          setEditingWhiskey(whiskey)
          setIsEditFormOpen(true)
        }}
      />

      <WhiskeySelectModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        whiskeys={whiskeys}
        onSelect={async (whiskey) => {
          if (confirm(`정말로 "${whiskey.name}" 위스키를 삭제하시겠습니까?`)) {
            try {
              await deleteWhiskey(whiskey.id)
              await loadWhiskeys()
            } catch (error) {
              console.error('Failed to delete whiskey:', error)
              alert('위스키 삭제에 실패했습니다.')
            }
          }
        }}
      />

      <WhiskeyForm
        open={isEditFormOpen}
        onOpenChange={(open) => {
          setIsEditFormOpen(open)
          if (!open) setEditingWhiskey(null)
        }}
        editingItem={editingWhiskey}
        onSaved={async (list) => {
          setWhiskeys(list)
          await loadWhiskeys()
        }}
      />

      <footer className="container mx-auto px-4 py-6 mt-8">
        <div className="text-center text-sm text-amber-900/60 dark:text-white/60">
          <div>© {new Date().getFullYear()} All rights reserved — Rusty · <a 
            href="mailto:blaze121304@gmail.com" 
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            blaze121304@gmail.com
          </a></div>
        </div>
      </footer>
    </motion.main>
  )
}



