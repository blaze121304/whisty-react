"use client"
import { Whiskey, WhiskeyCategory, WhiskeySubCategory } from '@/lib/types'
import { getAllWhiskeys, saveAllWhiskeys } from '@/lib/storage'

export const SEED_FLAG_KEY = 'whiskey.seeded.v1'

export async function ensureSeeded(): Promise<Whiskey[]> {
  const existing = await getAllWhiskeys()
  if (typeof window === 'undefined') return existing
  if (existing.length === 0 && !localStorage.getItem(SEED_FLAG_KEY)) {
    const seeds = generateSeedData()
    saveAllWhiskeys(seeds)
    localStorage.setItem(SEED_FLAG_KEY, '1')
    return seeds
  }
  // 간단한 브랜딩 정규화(예: brand가 'The'로 잘못 저장된 과거 시드 교정)
  const normalized = normalizeBrands(existing)
  // 유효하지 않은 Unsplash 이미지 URL 제거 (404 에러 방지)
  const cleaned = cleanInvalidImageUrls(normalized.list)
  // 기존 데이터에 subCategory 추가
  const withSubCategory = addSubCategories(cleaned.list)
  // 기존 데이터에 abv와 volume 기본값 추가
  const withDefaults = addDefaultAbvAndVolume(withSubCategory.list)
  if (normalized.changed || cleaned.changed || withSubCategory.changed || withDefaults.changed) {
    saveAllWhiskeys(withDefaults.list)
    return withDefaults.list
  }
  return existing
}

function addSubCategories(list: Whiskey[]): { changed: boolean; list: Whiskey[] } {
  let changed = false
  const subCategoryMap: Record<string, WhiskeySubCategory> = {
    '더 글렌리벳 12': 'Sherry',
    '글렌피딕 15': 'Sherry',
    '라프로익 10': 'Peat',
    '라가불린 16': 'Peat',
    '맥캘란 12 더블 캐스크': 'Sherry',
    '아드벡 우갸달': 'Peat',
    '오반 14': 'Peat',
    '탈리스커 10': 'Peat',
    '하이랜드 파크 12': 'Peat',
    '발베니 더블우드 12': 'Sherry',
    '글렌모렌지 오리지널 10': 'Bourbon',
    '아칸토션 12': 'Bourbon',
    '조니워커 블랙': 'Bourbon',
    '조니워커 그린': 'Bourbon',
    '치바사 12': 'Bourbon',
    '치바사 18': 'Sherry',
    '발렌타인 12': 'Bourbon',
    '발렌타인 17': 'Sherry',
    "듀어스 12": 'Bourbon',
    '니카 프롬 더 배럴': 'Bourbon',
    '카발란 클래식': 'Bourbon',
    '카발란 콘서트마스터': 'Sherry',
    '카발란 솔리스트 셰리': 'Sherry',
    '야마자키 12': 'Sherry',
    "하쿠슈 디스틸러스 리저브": 'Bourbon',
    '니카 코피 그레인': 'Bourbon',
    '요이치 싱글몰트': 'Peat',
    '미야기쿄 싱글몰트': 'Bourbon',
    '이와이 트래디션': 'Bourbon',
    '아카시 화이트 오크': 'Bourbon',
  }
  
  const next = list.map((w) => {
    // 위스키 카테고리이고 subCategory가 없는 경우에만 추가
    if ((w.category === 'Single Malt' || w.category === 'Blended Malt' || w.category === 'World Whiskey') && !w.subCategory) {
      const subCat = subCategoryMap[w.name]
      if (subCat) {
        changed = true
        return { ...w, subCategory: subCat, updatedAt: Date.now() }
      }
    }
    return w
  })
  return { changed, list: next }
}

function cleanInvalidImageUrls(list: Whiskey[]): { changed: boolean; list: Whiskey[] } {
  let changed = false
  const next = list.map((w) => {
    // Unsplash URL이 있지만 유효하지 않을 수 있으므로 제거
    if (w.imageDataUrl && (w.imageDataUrl.startsWith('https://images.unsplash.com') || w.imageDataUrl.startsWith('http://images.unsplash.com'))) {
      changed = true
      return { ...w, imageDataUrl: undefined, updatedAt: Date.now() }
    }
    return w
  })
  return { changed, list: next }
}

function addDefaultAbvAndVolume(list: Whiskey[]): { changed: boolean; list: Whiskey[] } {
  let changed = false
  const next = list.map((w) => {
    const updates: Partial<Whiskey> = {}
    let itemChanged = false
    // abv가 없으면 기본값 40 추가
    if (w.abv == null) {
      updates.abv = 40
      itemChanged = true
      changed = true
    }
    // volume이 없으면 기본값 700 추가
    if (w.volume == null) {
      updates.volume = 700
      itemChanged = true
      changed = true
    }
    if (itemChanged) {
      return { ...w, ...updates, updatedAt: Date.now() }
    }
    return w
  })
  return { changed, list: next }
}

export function generateSeedData(): Whiskey[] {
  const now = Date.now()
  const items: Array<{ name: string; englishName: string; brand: string; category: WhiskeyCategory; subCategory?: WhiskeySubCategory; url: string }> = [
    // Single Malt (12)
    { name: '더 글렌리벳 12', englishName: 'The Glenlivet 12', brand: 'Glenlivet', category: 'Single Malt', subCategory: 'Sherry', url: 'https://images.unsplash.com/photo-1602103832252-38600f5caa3a?q=80&w=1200&auto=format&fit=crop' },
    { name: '글렌피딕 15', englishName: 'Glenfiddich 15', brand: 'Glenfiddich', category: 'Single Malt', subCategory: 'Sherry', url: 'https://images.unsplash.com/photo-1623966374000-07aa8f1f1f2b?q=80&w=1200&auto=format&fit=crop' },
    { name: '라프로익 10', englishName: 'Laphroaig 10', brand: 'Laphroaig', category: 'Single Malt', subCategory: 'Peat', url: 'https://images.unsplash.com/photo-1613478223719-2c0d2db569f4?q=80&w=1200&auto=format&fit=crop' },
    { name: '라가불린 16', englishName: 'Lagavulin 16', brand: 'Lagavulin', category: 'Single Malt', subCategory: 'Peat', url: 'https://images.unsplash.com/photo-1567608593255-76e4a7a6be8a?q=80&w=1200&auto=format&fit=crop' },
    { name: '맥캘란 12 더블 캐스크', englishName: 'The Macallan 12 Double Cask', brand: 'Macallan', category: 'Single Malt', subCategory: 'Sherry', url: 'https://images.unsplash.com/photo-1617191518501-8d9c316bed36?q=80&w=1200&auto=format&fit=crop' },
    { name: '아드벡 우갸달', englishName: 'Ardbeg Uigeadail', brand: 'Ardbeg', category: 'Single Malt', subCategory: 'Peat', url: 'https://images.unsplash.com/photo-1617191481856-3a27c8c1a1de?q=80&w=1200&auto=format&fit=crop' },
    { name: '오반 14', englishName: 'Oban 14', brand: 'Oban', category: 'Single Malt', subCategory: 'Peat', url: 'https://images.unsplash.com/photo-1567608593255-76e4a7a6be8b?q=80&w=1200&auto=format&fit=crop' },
    { name: '탈리스커 10', englishName: 'Talisker 10', brand: 'Talisker', category: 'Single Malt', subCategory: 'Peat', url: 'https://images.unsplash.com/photo-1567608593255-76e4a7a6be8c?q=80&w=1200&auto=format&fit=crop' },
    { name: '하이랜드 파크 12', englishName: 'Highland Park 12', brand: 'Highland Park', category: 'Single Malt', subCategory: 'Peat', url: 'https://images.unsplash.com/photo-1567608593255-76e4a7a6be8d?q=80&w=1200&auto=format&fit=crop' },
    { name: '발베니 더블우드 12', englishName: "The Balvenie DoubleWood 12", brand: 'Balvenie', category: 'Single Malt', subCategory: 'Sherry', url: 'https://images.unsplash.com/photo-1617191481852-2fef946b6f11?q=80&w=1200&auto=format&fit=crop' },
    { name: '글렌모렌지 오리지널 10', englishName: 'Glenmorangie Original 10', brand: 'Glenmorangie', category: 'Single Malt', subCategory: 'Bourbon', url: 'https://images.unsplash.com/photo-1617191518478-6fe59de0b9e5?q=80&w=1200&auto=format&fit=crop' },
    { name: '아칸토션 12', englishName: 'Auchentoshan 12', brand: 'Auchentoshan', category: 'Single Malt', subCategory: 'Bourbon', url: 'https://images.unsplash.com/photo-1613478223729-2c0d2db569f5?q=80&w=1200&auto=format&fit=crop' },
    // Blended Malt (8)
    { name: '조니워커 블랙', englishName: 'Johnnie Walker Black', brand: 'Johnnie Walker', category: 'Blended Malt', subCategory: 'Bourbon', url: 'https://images.unsplash.com/photo-1527161153336-2d3d2d50fd6b?q=80&w=1200&auto=format&fit=crop' },
    { name: '조니워커 그린', englishName: 'Johnnie Walker Green', brand: 'Johnnie Walker', category: 'Blended Malt', subCategory: 'Bourbon', url: 'https://images.unsplash.com/photo-1527161153336-2d3d2d50fd6c?q=80&w=1200&auto=format&fit=crop' },
    { name: '치바사 12', englishName: 'Chivas Regal 12', brand: 'Chivas', category: 'Blended Malt', subCategory: 'Bourbon', url: 'https://images.unsplash.com/photo-1574096079513-8d0d2b6a1bff?q=80&w=1200&auto=format&fit=crop' },
    { name: '치바사 18', englishName: 'Chivas Regal 18', brand: 'Chivas', category: 'Blended Malt', subCategory: 'Sherry', url: 'https://images.unsplash.com/photo-1574096079513-8d0d2b6a1bfe?q=80&w=1200&auto=format&fit=crop' },
    { name: '발렌타인 12', englishName: "Ballantine's 12", brand: "Ballantine's", category: 'Blended Malt', subCategory: 'Bourbon', url: 'https://images.unsplash.com/photo-1617191518479-6fe59de0b9e6?q=80&w=1200&auto=format&fit=crop' },
    { name: '발렌타인 17', englishName: "Ballantine's 17", brand: "Ballantine's", category: 'Blended Malt', subCategory: 'Sherry', url: 'https://images.unsplash.com/photo-1617191518480-6fe59de0b9e7?q=80&w=1200&auto=format&fit=crop' },
    { name: '듀어스 12', englishName: "Dewar's 12", brand: "Dewar's", category: 'Blended Malt', subCategory: 'Bourbon', url: 'https://images.unsplash.com/photo-1617191518481-6fe59de0b9e8?q=80&w=1200&auto=format&fit=crop' },
    { name: '니카 프롬 더 배럴', englishName: 'Nikka From The Barrel', brand: 'Nikka', category: 'Blended Malt', subCategory: 'Bourbon', url: 'https://images.unsplash.com/photo-1617191481861-3a27c8c1a1df?q=80&w=1200&auto=format&fit=crop' },
    // World Whiskey - Taiwan/Japan (10)
    { name: '카발란 클래식', englishName: 'Kavalan Classic', brand: 'Kavalan', category: 'World Whiskey', subCategory: 'Bourbon', url: 'https://images.unsplash.com/photo-1617191481862-3a27c8c1a1e0?q=80&w=1200&auto=format&fit=crop' },
    { name: '카발란 콘서트마스터', englishName: 'Kavalan Concertmaster', brand: 'Kavalan', category: 'World Whiskey', subCategory: 'Sherry', url: 'https://images.unsplash.com/photo-1617191481863-3a27c8c1a1e1?q=80&w=1200&auto=format&fit=crop' },
    { name: '카발란 솔리스트 셰리', englishName: 'Kavalan Solist Sherry', brand: 'Kavalan', category: 'World Whiskey', subCategory: 'Sherry', url: 'https://images.unsplash.com/photo-1617191481864-3a27c8c1a1e2?q=80&w=1200&auto=format&fit=crop' },
    { name: '야마자키 12', englishName: 'Yamazaki 12', brand: 'Suntory', category: 'World Whiskey', subCategory: 'Sherry', url: 'https://images.unsplash.com/photo-1590152007943-983b2981512a?q=80&w=1200&auto=format&fit=crop' },
    { name: '하쿠슈 디스틸러스 리저브', englishName: "Hakushu Distiller's Reserve", brand: 'Suntory', category: 'World Whiskey', subCategory: 'Bourbon', url: 'https://images.unsplash.com/photo-1590152007943-983b2981512b?q=80&w=1200&auto=format&fit=crop' },
    { name: '니카 코피 그레인', englishName: 'Nikka Coffey Grain', brand: 'Nikka', category: 'World Whiskey', subCategory: 'Bourbon', url: 'https://images.unsplash.com/photo-1617191481865-3a27c8c1a1e3?q=80&w=1200&auto=format&fit=crop' },
    { name: '요이치 싱글몰트', englishName: 'Yoichi Single Malt', brand: 'Nikka', category: 'World Whiskey', subCategory: 'Peat', url: 'https://images.unsplash.com/photo-1617191481866-3a27c8c1a1e4?q=80&w=1200&auto=format&fit=crop' },
    { name: '미야기쿄 싱글몰트', englishName: 'Miyagikyo Single Malt', brand: 'Nikka', category: 'World Whiskey', subCategory: 'Bourbon', url: 'https://images.unsplash.com/photo-1617191481867-3a27c8c1a1e5?q=80&w=1200&auto=format&fit=crop' },
    { name: '이와이 트래디션', englishName: 'Iwai Tradition', brand: 'Mars', category: 'World Whiskey', subCategory: 'Bourbon', url: 'https://images.unsplash.com/photo-1617191481868-3a27c8c1a1e6?q=80&w=1200&auto=format&fit=crop' },
    { name: '아카시 화이트 오크', englishName: 'Akashi White Oak', brand: 'Eigashima', category: 'World Whiskey', subCategory: 'Bourbon', url: 'https://images.unsplash.com/photo-1617191481869-3a27c8c1a1e7?q=80&w=1200&auto=format&fit=crop' },
  ]

  // ensure 30 unique items
  const list: Whiskey[] = items.slice(0, 30).map((base, i) => ({
    id: String(now - i),
    name: base.name,
    englishName: base.englishName,
    brand: base.brand,
    category: base.category,
    subCategory: base.subCategory,
    abv: 40, // 기본값
    volume: 700, // 기본값
    purchaseDate: '',
    price: 0,
    imageDataUrl: undefined, // 이미지는 사용자가 직접 업로드하도록 설정
    notes: '',
    createdAt: now - i * 1000,
    updatedAt: now - i * 1000,
  }))
  return list
}

function normalizeBrands(list: Whiskey[]): { changed: boolean; list: Whiskey[] } {
  let changed = false
  const next = list.map((w) => {
    const en = w.englishName || ''
    // Case 1: "The Glenlivet" → "Glenlivet", "The Macallan" → "Macallan"
    if ((w.brand === 'The' || /^The\s+/.test(en)) && /^The\s+/.test(en)) {
      const tokens = en.split(/\s+/)
      const fixedBrand = tokens[1] || w.brand
      if (fixedBrand && fixedBrand !== w.brand) {
        changed = true
        return { ...w, brand: fixedBrand, updatedAt: Date.now() }
      }
    }
    // Case 2: "Johnnie Walker Black" → brand should be "Johnnie Walker"
    if ((w.brand === 'Johnnie' || w.brand === 'Walker') && /^Johnnie\s+Walker\b/.test(en)) {
      const fixedBrand = 'Johnnie Walker'
      if (fixedBrand !== w.brand) {
        changed = true
        return { ...w, brand: fixedBrand, updatedAt: Date.now() }
      }
    }
    // Case 3: "Chivas Regal 12" → brand should be "Chivas"
    if ((w.brand === 'Chivas Regal' || w.brand === 'Regal') && /^Chivas\s+Regal\b/.test(en)) {
      const fixedBrand = 'Chivas'
      if (fixedBrand !== w.brand) {
        changed = true
        return { ...w, brand: fixedBrand, updatedAt: Date.now() }
      }
    }
    // Case 4: Single-word brands from englishName start
    const singleWordMatch = en.match(/^(Glenfiddich|Lagavulin|Laphroaig|Ardbeg|Kavalan|Yamazaki|Hakushu|Nikka)\b/)
    if (singleWordMatch && w.brand !== singleWordMatch[1]) {
      changed = true
      return { ...w, brand: singleWordMatch[1], updatedAt: Date.now() }
    }
    return w
  })
  return { changed, list: next }
}


