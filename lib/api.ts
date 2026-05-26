"use client"
import { Whiskey, WhiskeyCategory, WhiskeySubCategory } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.0.206:10006/api'

// API 응답 타입
interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

// 스타일/카테고리 변환 함수 (프론트엔드 -> 백엔드 style/category)
function toBackendStyle(category: WhiskeyCategory): string {
  const mapping: Record<WhiskeyCategory, string> = {
    'Single Malt': 'SINGLE_MALT',
    'Blended': 'BLENDED',
    'Grain/Bourbon/Rye': 'GRAIN_BOURBON_RYE',
    'Gin & Vodka': 'GIN_VODKA',
    'Wine & Liqueur': 'WINE_LIQUEUR',
    'Sake & Traditional': 'SAKE_TRADITIONAL',
    'Beer & Soju': 'BEER_SOJU',
  }
  return mapping[category] || category
}

// 카테고리 변환 함수 (백엔드 -> 프론트엔드)
function fromBackendCategory(category: string): WhiskeyCategory {
  const mapping: Record<string, WhiskeyCategory> = {
    SINGLE_MALT: 'Single Malt',
    BLENDED: 'Blended',
    GRAIN_BOURBON_RYE: 'Grain/Bourbon/Rye',
    WORLD_WHISKEY: 'Grain/Bourbon/Rye',
    GIN_VODKA: 'Gin & Vodka',
    WINE_LIQUEUR: 'Wine & Liqueur',
    SAKE_TRADITIONAL: 'Sake & Traditional',
    BEER_SOJU: 'Beer & Soju',
  }
  const key = category != null ? String(category).toUpperCase().trim() : ''
  return mapping[key] ?? (category as WhiskeyCategory)
}

// 서브카테고리/characteristic 변환 (SHERRY / BOURBON / PEAT 만 지원, WINE_PORT 제거)
const BACKEND_CASK_VALUES = new Set(['SHERRY', 'PEAT', 'BOURBON'])

function toBackendSubCategory(subCategory: string): string {
  const mapping: Record<string, string> = {
    Sherry: 'SHERRY',
    Peat: 'PEAT',
    Bourbon: 'BOURBON',
  }
  return mapping[subCategory] || subCategory
}

function fromBackendSubCategory(subCategory: string): WhiskeySubCategory | null {
  const key = String(subCategory).toUpperCase()
  if (!BACKEND_CASK_VALUES.has(key)) return null
  const mapping: Record<string, WhiskeySubCategory> = {
    SHERRY: 'Sherry',
    PEAT: 'Peat',
    BOURBON: 'Bourbon',
  }
  return mapping[key] ?? null
}

// 캐스크 뱃지 비표시: Blended, Grain/Bourbon/Rye 는 "캐스크 종류"가 아니므로 characteristics 미사용
const CASK_HIDDEN_CATEGORIES: WhiskeyCategory[] = ['Blended', 'Grain/Bourbon/Rye']

// 백엔드 응답을 프론트엔드 타입으로 변환
function transformWhiskey(backendWhiskey: any): Whiskey {
  const category = fromBackendCategory(backendWhiskey.category)
  const skipCask = CASK_HIDDEN_CATEGORIES.includes(category)
  const backendCharacteristics: string[] | undefined = skipCask
    ? undefined
    : (backendWhiskey.characteristics ?? backendWhiskey.subCategories)
  const subCategories = backendCharacteristics
    ?.map((sc: string) => fromBackendSubCategory(sc))
    .filter((sc): sc is WhiskeySubCategory => sc != null)

  const legacySubCategory =
    backendWhiskey.subCategory && !skipCask
      ? fromBackendSubCategory(backendWhiskey.subCategory)
      : null

  return {
    id: String(backendWhiskey.id),
    name: backendWhiskey.name,
    englishName: backendWhiskey.englishName,
    brand: backendWhiskey.brand,
    category,
    subCategories: subCategories?.length ? subCategories : undefined,
    subCategory: legacySubCategory ?? undefined,
    abv: backendWhiskey.abv,
    volume: backendWhiskey.volume,
    nation: backendWhiskey.nation,
    region: backendWhiskey.region,
    starPoint: backendWhiskey.starPoint,
    imageDataUrl: backendWhiskey.imageDataUrl,
    notes: backendWhiskey.notes,
    nose: backendWhiskey.nose,
    palate: backendWhiskey.palate,
    finish: backendWhiskey.finish,
    personalNote: backendWhiskey.personalNote,
    pairings: backendWhiskey.pairings,
    flavorTags: backendWhiskey.flavorTags,
    createdAt: backendWhiskey.createdAt,
    updatedAt: backendWhiskey.updatedAt,
  }
}

// 프론트엔드 타입을 백엔드 요청 형식으로 변환
function transformWhiskeyForBackend(whiskey: Partial<Whiskey>): any {
  const result: any = {}
  
  if (whiskey.name !== undefined) result.name = whiskey.name
  if (whiskey.englishName !== undefined) result.englishName = whiskey.englishName
  if (whiskey.brand !== undefined) result.brand = whiskey.brand
  if (whiskey.category !== undefined) result.category = toBackendStyle(whiskey.category)
  if (whiskey.subCategories !== undefined) {
    // 백엔드 스펙: characteristics 필드 사용
    result.characteristics = whiskey.subCategories
      .map((sc) => toBackendSubCategory(sc))
      .filter((c) => BACKEND_CASK_VALUES.has(c))
  }
  if (whiskey.abv !== undefined) result.abv = whiskey.abv
  if (whiskey.volume !== undefined) result.volume = whiskey.volume
  if (whiskey.nation !== undefined) result.nation = whiskey.nation
  if (whiskey.region !== undefined) result.region = whiskey.region
  if (whiskey.starPoint !== undefined) result.starPoint = whiskey.starPoint
  if (whiskey.imageDataUrl !== undefined) result.imageDataUrl = whiskey.imageDataUrl
  if (whiskey.notes !== undefined) result.notes = whiskey.notes
  if (whiskey.nose !== undefined) result.nose = whiskey.nose
  if (whiskey.palate !== undefined) result.palate = whiskey.palate
  if (whiskey.finish !== undefined) result.finish = whiskey.finish
  if (whiskey.personalNote !== undefined) result.personalNote = whiskey.personalNote
  if (whiskey.pairings !== undefined) result.pairings = whiskey.pairings
  if (whiskey.flavorTags !== undefined) result.flavorTags = whiskey.flavorTags
  
  return result
}

// API 에러 처리
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

/** 목록 API style 쿼리: 미전송=위스키만, spirit-all→OTHER, 개별 카테고리→해당 style */
export type StyleQuery = WhiskeyCategory | 'spirit-all'

function appendStyleQuery(queryParams: URLSearchParams, style?: StyleQuery) {
  if (!style || style === 'spirit-all') {
    if (style === 'spirit-all') queryParams.append('style', 'OTHER')
    return
  }
  queryParams.append('style', toBackendStyle(style))
}

// API 클라이언트
export const whiskeyApi = {
  // 전체 위스키 목록 조회
  async getAll(params?: {
    style?: StyleQuery
    search?: string
    cask?: WhiskeySubCategory | 'Other'
    nation?: string
    page?: number
    size?: number
    sort?: string
  }): Promise<Whiskey[]> {
    const queryParams = new URLSearchParams()
    appendStyleQuery(queryParams, params?.style)
    // cask 파라미터
    if (params?.cask) {
      if (params.cask === 'Other') {
        queryParams.append('cask', 'OTHER')
      } else {
        queryParams.append('cask', toBackendSubCategory(params.cask))
      }
    }
    // nation 파라미터
    if (params?.nation) queryParams.append('nation', params.nation)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.page !== undefined) queryParams.append('page', String(params.page))
    if (params?.size !== undefined) queryParams.append('size', String(params.size))
    if (params?.sort) queryParams.append('sort', params.sort)

    const response = await fetch(`${API_BASE_URL}/whiskeys?${queryParams.toString()}`)
    if (!response.ok) {
      throw new ApiError(response.status, `Failed to fetch whiskeys: ${response.statusText}`)
    }
    const data: PageResponse<any> = await response.json()
    return data.content.map(transformWhiskey)
  },

  // 위스키 상세 조회
  async getById(id: string): Promise<Whiskey> {
    const response = await fetch(`${API_BASE_URL}/whiskeys/${id}`)
    if (!response.ok) {
      if (response.status === 404) {
        throw new ApiError(404, 'Whiskey not found')
      }
      throw new ApiError(response.status, `Failed to fetch whiskey: ${response.statusText}`)
    }
    const data = await response.json()
    return transformWhiskey(data)
  },

  // 위스키 생성
  async create(whiskey: Partial<Whiskey>, imageFile?: File): Promise<Whiskey> {
    const formData = new FormData()
    const whiskeyData = transformWhiskeyForBackend(whiskey)
    
    // FormData에 필드 추가
    Object.entries(whiskeyData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // 배열은 각 항목을 개별적으로 추가 (Spring Boot가 배열로 인식)
          value.forEach((item, index) => {
            if (typeof item === 'object') {
              // 객체 배열 (pairings)의 경우 JSON으로 변환
              formData.append(`${key}[${index}]`, JSON.stringify(item))
            } else {
              // 단순 배열 (subCategories, flavorTags)
              formData.append(`${key}[${index}]`, String(item))
            }
          })
        } else {
          formData.append(key, String(value))
        }
      }
    })
    
    if (imageFile) {
      formData.append('image', imageFile)
    }

    const response = await fetch(`${API_BASE_URL}/whiskeys`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new ApiError(response.status, errorData.message || `Failed to create whiskey: ${response.statusText}`)
    }
    const data = await response.json()
    return transformWhiskey(data)
  },

  // 위스키 수정
  async update(id: string, whiskey: Partial<Whiskey>, imageFile?: File): Promise<Whiskey> {
    const formData = new FormData()
    const whiskeyData = transformWhiskeyForBackend(whiskey)
    
    // FormData에 필드 추가
    Object.entries(whiskeyData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // 배열은 각 항목을 개별적으로 추가 (Spring Boot가 배열로 인식)
          value.forEach((item, index) => {
            if (typeof item === 'object') {
              // 객체 배열 (pairings)의 경우 JSON으로 변환
              formData.append(`${key}[${index}]`, JSON.stringify(item))
            } else {
              // 단순 배열 (subCategories, flavorTags)
              formData.append(`${key}[${index}]`, String(item))
            }
          })
        } else {
          formData.append(key, String(value))
        }
      }
    })
    
    if (imageFile) {
      formData.append('image', imageFile)
    }

    const response = await fetch(`${API_BASE_URL}/whiskeys/${id}`, {
      method: 'PUT',
      body: formData,
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new ApiError(response.status, errorData.message || `Failed to update whiskey: ${response.statusText}`)
    }
    const data = await response.json()
    return transformWhiskey(data)
  },

  // 위스키 삭제
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/whiskeys/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new ApiError(response.status, `Failed to delete whiskey: ${response.statusText}`)
    }
  },

  // 이미지 업로드
  async uploadImage(id: string, imageFile: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', imageFile)

    const response = await fetch(`${API_BASE_URL}/whiskeys/${id}/image`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      throw new ApiError(response.status, `Failed to upload image: ${response.statusText}`)
    }
    const data = await response.json()
    return data.imageDataUrl
  },

  // 이미지 삭제
  async deleteImage(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/whiskeys/${id}/image`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new ApiError(response.status, `Failed to delete image: ${response.statusText}`)
    }
  },
}

export { ApiError }

