import { ISupplier } from './supplier'
import { ICategory } from './category'
import { IUnit } from './unit'
import { IImage } from './image'

export interface IProduct {
  id: number
  status: boolean
  serial_number: string
  name: string
  description: string
  stock: number
  price: number
  expiry_period: number
  unit_id: number
  supplier_id: number
  category_id: number
  images: IImage[]
  supplier: ISupplier
  category: ICategory
  unit: IUnit
  created_at: string
  updated_at: string
  deleted_at?: string | null
}
