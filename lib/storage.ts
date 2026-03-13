"use client"
import { Whiskey, WhiskeyCategory, WhiskeySubCategory } from './types'
import { whiskeyApi } from './api'

// API 기반으로 변경된 storage 함수들
// 기존 코드와의 호환성을 위해 함수 시그니처는 유지

export type GetAllWhiskeysParams = {
  category?: WhiskeyCategory
  search?: string
  cask?: WhiskeySubCategory | 'Other'
  nation?: string
  page?: number
  size?: number
  sort?: string
}

export async function getAllWhiskeys(params?: GetAllWhiskeysParams): Promise<Whiskey[]> {
  try {
    return await whiskeyApi.getAll(params)
  } catch (error) {
    console.error('Failed to fetch whiskeys:', error)
    return []
  }
}

// 동기 함수는 더 이상 사용하지 않지만, 호환성을 위해 유지
export function saveAllWhiskeys(list: Whiskey[]) {
  // API 기반에서는 사용하지 않음 (각 항목별로 API 호출)
  console.warn('saveAllWhiskeys is deprecated. Use API methods instead.')
}

export async function upsertWhiskey(item: Partial<Whiskey>, imageFile?: File): Promise<Whiskey[]> {
  try {
    if (item.id && item.id !== '') {
      // 기존 항목 수정
      await whiskeyApi.update(item.id, item, imageFile)
    } else {
      // 새 항목 생성
      await whiskeyApi.create(item, imageFile)
    }
    // 업데이트된 목록 반환
    return await getAllWhiskeys({ size: 500 })
  } catch (error) {
    console.error('Failed to upsert whiskey:', error)
    throw error
  }
}

export async function getWhiskeyById(id: string): Promise<Whiskey | undefined> {
  try {
    return await whiskeyApi.getById(id)
  } catch (error) {
    console.error('Failed to fetch whiskey:', error)
    return undefined
  }
}

export async function deleteWhiskey(id: string): Promise<Whiskey[]> {
  try {
    await whiskeyApi.delete(id)
    // 삭제 후 목록 반환
    return await getAllWhiskeys({ size: 500 })
  } catch (error) {
    console.error('Failed to delete whiskey:', error)
    throw error
  }
}



