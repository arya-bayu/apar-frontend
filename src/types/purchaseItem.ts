import { ICategory } from './category'
import { IProduct } from './product'

export interface IPurchaseItem {
  id?: number
  category_id: number
  product_id: number
  description: string
  unit_price: number
  quantity: number
  discount?: number
  tax_percentage?: number
  total_price: number
  category: ICategory
  product: IProduct
  created_at?: string
  updated_at?: string
}
