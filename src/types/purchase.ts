import { ISupplier } from './supplier'
import { IImage } from './image'
import { IPurchaseItem } from './purchaseItem'

export interface IPurchase {
  id: number
  status: number
  purchase_number: string
  date: Date
  supplier_id: number
  tax: number
  discount: number
  total: number
  description: string
  images: IImage[]
  supplier: ISupplier
  purchase_items: IPurchaseItem[]
  created_at: string
  updated_at: string
}
