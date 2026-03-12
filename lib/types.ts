// UI에서 사용하는 카테고리 레이블
export type WhiskeyCategory =
  | 'Single Malt'
  | 'Blended'
  | 'Grain/Bourbon/Rye'
  | 'Gin & Vodka'
  | 'Wine & Liqueur'
  | 'Sake & Traditional'
  | 'Beer & Soju'

// 캐스크/풍미 특성 (백엔드 characteristics/cask와 매핑)
export type WhiskeySubCategory = 'Sherry' | 'Peat' | 'Bourbon' | 'Wine/Port'

export interface Whiskey {
  id: string
  name: string
  englishName?: string
  brand: string
  category: WhiskeyCategory
  subCategories?: WhiskeySubCategory[] // 위스키 카테고리(싱글몰트, 블렌디드 제외, 월드위스키)의 경우: 셰리, 피트, 버번 (여러 개 선택 가능)
  // 하위 호환성을 위해 subCategory도 유지 (deprecated)
  subCategory?: WhiskeySubCategory
  abv?: number // 알코올 도수 (Alcohol By Volume)
  volume?: number // 용량 (ml)
  nation?: string // 국가
  region?: string // 생산지역
  starPoint?: number // 별점
  imageDataUrl?: string
  notes?: string
  nose?: string
  palate?: string
  finish?: string
  personalNote?: string // 개인 소감
  pairings?: { icon: string; name: string }[] // 페어링 추천
  flavorTags?: string[] // 테이스팅 프로파일 태그
  price?: number  // 여기 추가
  createdAt: number
  updatedAt: number
}



