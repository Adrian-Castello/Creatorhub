import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { ImageUploader } from '../ui/ImageUploader'
import { StatusPicker } from './StatusPicker'
import type { Product, ProductStatus } from '../../lib/types'
import { useData } from '../../hooks/useData'

interface Props {
  open: boolean
  onClose: () => void
  /** product to edit; undefined = create */
  product?: Product
}

export function ProductForm({ open, onClose, product }: Props) {
  const { createProduct, updateProduct } = useData()
  const isEdit = Boolean(product)

  const [name, setName] = useState('')
  const [commission, setCommission] = useState('')
  const [status, setStatus] = useState<ProductStatus>('solicitado')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(product?.name ?? '')
      setCommission(product ? String(product.commission_pct) : '')
      setStatus(product?.status ?? 'solicitado')
      setImageUrl(product?.image_url ?? null)
    }
  }, [open, product])

  const commissionNum = parseFloat(commission)
  const nameValid = name.trim().length > 0
  const commissionValid =
    !isNaN(commissionNum) && commissionNum >= 0 && commissionNum <= 100
  const valid = nameValid && commissionValid

  async function save() {
    if (!valid) return
    setSaving(true)
    const payload = {
      name: name.trim(),
      image_url: imageUrl,
      commission_pct: commissionNum,
      price: product?.price ?? 0,
      status,
    }
    if (isEdit && product) {
      await updateProduct(product.id, payload)
    } else {
      await createProduct(payload)
    }
    setSaving(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar producto' : 'Nuevo producto'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={!valid || saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <span className="mb-1.5 block text-sm font-medium text-muted">Imagen</span>
          <ImageUploader value={imageUrl} onChange={setImageUrl} />
        </div>

        <Input
          label="Nombre *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del producto"
          error={!nameValid && name.length > 0 ? 'Obligatorio' : undefined}
        />

        <Input
          label="Comisión %"
          type="number"
          step="0.01"
          min={0}
          max={100}
          suffix="%"
          value={commission}
          onChange={(e) => setCommission(e.target.value)}
          placeholder="12.50"
          error={
            commission.length > 0 && !commissionValid ? '0–100' : undefined
          }
        />

        <div>
          <span className="mb-2 block text-sm font-medium text-muted">Estado</span>
          <StatusPicker value={status} onChange={setStatus} />
        </div>
      </div>
    </Modal>
  )
}
