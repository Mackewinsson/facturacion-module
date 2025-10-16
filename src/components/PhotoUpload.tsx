'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface PhotoUploadProps {
  orderNumber: string
  onPhotoUploaded?: (photoUrl: string) => void
  existingPhotos?: string[]
  maxPhotos?: number
}

interface UploadedPhoto {
  id: string
  url: string
  filename: string
  uploadedAt: string
}

export default function PhotoUpload({ 
  orderNumber, 
  onPhotoUploaded, 
  existingPhotos = [], 
  maxPhotos = 10 
}: PhotoUploadProps) {
  
  const [photos, setPhotos] = useState<UploadedPhoto[]>(existingPhotos.map((url, index) => ({
    id: `existing-${index}`,
    url,
    filename: `photo-${index + 1}.jpg`,
    uploadedAt: new Date().toISOString()
  })))
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [uploadResult, setUploadResult] = useState<{success: number, errors: number} | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                 window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Clear upload result after 3 seconds
  useEffect(() => {
    if (uploadResult) {
      const timer = setTimeout(() => setUploadResult(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [uploadResult])

  // Clear photos when order number changes
  useEffect(() => {
    setPhotos(existingPhotos.map((url, index) => ({
      id: `existing-${index}`,
      url,
      filename: `photo-${index + 1}.jpg`,
      uploadedAt: new Date().toISOString()
    })))
    setImageErrors(new Set()) // Clear any image errors
  }, [orderNumber, existingPhotos])

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newFiles = Array.from(files).slice(0, maxPhotos - photos.length)
    if (newFiles.length === 0) {
      alert(`Máximo ${maxPhotos} fotos permitidas`)
      return
    }

    setUploading(true)
    setUploadResult(null)

    let successCount = 0
    let errorCount = 0

    try {
      for (const file of newFiles) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          errorCount++
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          errorCount++
          continue
        }

        const formData = new FormData()
        formData.append('photo', file)
        formData.append('orderNumber', orderNumber)

        const response = await fetch('/api/orders/photos/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          const newPhoto: UploadedPhoto = {
            id: result.id,
            url: result.url,
            filename: file.name,
            uploadedAt: new Date().toISOString()
          }
          
          setPhotos(prev => [...prev, newPhoto])
          onPhotoUploaded?.(result.url)
          successCount++
        } else {
          errorCount++
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      errorCount++
    } finally {
      setUploading(false)
      setUploadResult({ success: successCount, errors: errorCount })
    }
  }

  const handleImageError = (photoId: string) => {
    setImageErrors(prev => new Set(prev).add(photoId))
  }


  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Fotos de la Orden</h3>
        <div className="text-sm text-gray-500">
          {photos.length}/{maxPhotos} fotos
        </div>
      </div>

      {/* Upload Result Message */}
      {uploadResult && (
        <div className={`p-3 rounded-md text-sm font-medium ${
          uploadResult.errors > 0 
            ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' 
            : 'bg-green-50 text-green-800 border border-green-200'
        }`}>
          {uploadResult.success > 0 && (
            <div>✅ {uploadResult.success} foto{uploadResult.success !== 1 ? 's' : ''} subida{uploadResult.success !== 1 ? 's' : ''} correctamente</div>
          )}
          {uploadResult.errors > 0 && (
            <div>⚠️ {uploadResult.errors} foto{uploadResult.errors !== 1 ? 's' : ''} no se pudieron subir</div>
          )}
        </div>
      )}

      {/* Upload Area */}
      {photos.length < maxPhotos && (
        <div>
          {isMobile ? (
            // Mobile-optimized upload buttons
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Galería</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Cámara</span>
                </button>
              </div>
              
              <div className="text-center text-xs text-gray-500">
                JPG, PNG, GIF hasta 5MB cada una
              </div>
            </div>
          ) : (
            // Desktop drag & drop area
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="space-y-2">
                <div className="text-4xl">📷</div>
                <div className="text-sm text-gray-600">
                  Arrastra fotos aquí o{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                    disabled={uploading}
                  >
                    selecciona archivos
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  JPG, PNG, GIF hasta 5MB cada una
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Upload Progress */}
      {uploading && (
        <div className="flex items-center justify-center space-x-2 text-blue-600 py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-sm font-medium">Subiendo fotos...</span>
        </div>
      )}

      {/* Mobile-Optimized Photo Grid */}
      {photos.length > 0 && (
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                {imageErrors.has(photo.id) ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📷</div>
                      <div className="text-xs text-gray-500">Imagen no disponible</div>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={photo.url}
                    alt={photo.filename}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(photo.id)}
                  />
                )}
              </div>
              

              {/* Photo Info - Hidden on mobile to save space */}
              {!isMobile && (
                <div className="mt-1 text-xs text-gray-500 truncate">
                  {photo.filename}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && !uploading && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📷</div>
          <div className="text-sm">No hay fotos subidas para esta orden</div>
          {isMobile && (
            <div className="text-xs mt-1 text-gray-400">
              Toca los botones de arriba para agregar fotos
            </div>
          )}
        </div>
      )}
    </div>
  )
}
