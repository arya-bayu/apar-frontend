import { IImage } from './image'

export interface IFeature {
  id: number
  icon: string
  name: string
  description: string
}

export interface ICategory {
  id: number
  name: string
  description: string
  features?: IFeature[]
  image?: IImage
  created_by: number | null
  updated_by: number | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}
