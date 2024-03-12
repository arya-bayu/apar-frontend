import { ICategory } from './category'
import { IImage } from './image'
import { ISupplier } from './supplier'
import { IUnit } from './unit'

export interface IProduct {
  id: number
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
  unit: IUnit
  category: ICategory
  supplier: ISupplier
  created_by: number | null
  updated_by: number | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}
