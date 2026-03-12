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
    'SINGLE_MALT': 'Single Malt',
    'BLENDED': 'Blended',
    'GRAIN_BOURBON_RYE': 'Grain/Bourbon/Rye',
    'GIN_VODKA': 'Gin & Vodka',
    'WINE_LIQUEUR': 'Wine & Liqueur',
    'SAKE_TRADITIONAL': 'Sake & Traditional',
    'BEER_SOJU': 'Beer & Soju',
  }
  return mapping[category] || category as WhiskeyCategory
}

// 서브카테고리/characteristic 변환 함수
function toBackendSubCategory(subCategory: string): string {
  const mapping: Record<string, string> = {
    'Sherry': 'SHERRY',
    'Peat': 'PEAT',
    'Bourbon': 'BOURBON',
    'Wine/Port': 'WINE_PORT',
  }
  return mapping[subCategory] || subCategory
}

function fromBackendSubCategory(subCategory: string): string {
  const mapping: Record<string, string> = {
    'SHERRY': 'Sherry',
    'PEAT': 'Peat',
    'BOURBON': 'Bourbon',
    'WINE_PORT': 'Wine/Port',
  }
  return mapping[subCategory] || subCategory
}

// 백엔드 응답을 프론트엔드 타입으로 변환
function transformWhiskey(backendWhiskey: any): Whiskey {
  // 백엔드 스펙: characteristics 필드에 SHERRY/PEAT/BOURBON 배열로 내려옴
  const backendCharacteristics: string[] | undefined =
    backendWhiskey.characteristics ?? backendWhiskey.subCategories

  return {
    id: String(backendWhiskey.id),
    name: backendWhiskey.name,
    englishName: backendWhiskey.englishName,
    brand: backendWhiskey.brand,
    category: fromBackendCategory(backendWhiskey.category),
    subCategories: backendCharacteristics?.map((sc: string) => fromBackendSubCategory(sc) as any),
    // 단일 subCategory는 하위 호환용 (기존 로컬스토리지 시드 등)
    subCategory: backendWhiskey.subCategory
      ? (fromBackendSubCategory(backendWhiskey.subCategory) as any)
      : undefined,
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
    result.characteristics = whiskey.subCategories.map(sc => toBackendSubCategory(sc))
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

// API 클라이언트
export const whiskeyApi = {
  // 전체 위스키 목록 조회
  async getAll(params?: {
    category?: WhiskeyCategory   // UI 스타일 필터
    search?: string
    cask?: WhiskeySubCategory | 'Other'
    nation?: string
    page?: number
    size?: number
    sort?: string
  }): Promise<Whiskey[]> {
    const queryParams = new URLSearchParams()
    // style 파라미터
    if (params?.category) queryParams.append('style', toBackendStyle(params.category))
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

