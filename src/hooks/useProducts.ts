import { useData } from './useData'

export function useProducts() {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useData()
  return { products, loading, createProduct, updateProduct, deleteProduct }
}
