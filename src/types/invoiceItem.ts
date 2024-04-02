import { ICategory } from './category'
import { IProduct } from './product'

export interface IInvoiceItem {
  id?: number
  category_id: number
  product_id: number
  description: string
  unit_price: number
  quantity: number
  total_price: number
  category: ICategory
  product: IProduct
  expiry_date?: Date
  created_at?: string
  updated_at?: string
}
