import { useData } from './useData'

export function useSales() {
  const { sales, upsertSale, deleteSale } = useData()
  return { sales, upsertSale, deleteSale }
}
