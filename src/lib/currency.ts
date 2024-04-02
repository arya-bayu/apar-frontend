export default function currencyFormatter(
  value: number,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    ...options,
  }).format(value)
}
