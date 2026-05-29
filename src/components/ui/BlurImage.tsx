import { useState } from 'react'
import { ImageIcon } from 'lucide-react'

interface Props {
  src: string | null
  alt?: string
  className?: string
}

export function BlurImage({ src, alt = '', className = '' }: Props) {
  const [loaded, setLoaded] = useState(false)

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.04] text-muted ${className}`}
      >
        <ImageIcon size={28} strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <div className={`overflow-hidden bg-black/[0.04] dark:bg-white/[0.04] ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover ${loaded ? 'img-loaded' : 'img-blur'}`}
      />
    </div>
  )
}
