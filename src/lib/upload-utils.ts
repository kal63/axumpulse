/**
 * File Upload Utilities
 * 
 * This file contains utility functions for handling file uploads,
 * API calls, and image URL management across the application.
 */

/**
 * Converts a relative image URL to a full URL pointing to the backend server
 * @param imageUrl - The image URL (can be relative or absolute)
 * @returns Full URL pointing to the backend server
 */
export function getImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl
  }
  
  // If the URL already starts with /api/v1, just prepend the base URL without /api/v1
  if (imageUrl.startsWith('/api/v1')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
    const baseWithoutApi = baseUrl.replace('/api/v1', '')
    return `${baseWithoutApi}${imageUrl}`
  }
  
  // For other relative URLs, prepend the full base URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
  return `${baseUrl}${imageUrl}`
}

/**
 * Upload a file to the backend server using FormData
 * @param file - The file to upload
 * @param endpoint - The API endpoint (e.g., '/trainer/upload/content', '/trainer/settings/profile-image')
 * @param fieldName - The form field name (e.g., 'file', 'profileImage')
 * @returns Promise with the upload response
 */
export async function uploadFile(
  file: File, 
  endpoint: string, 
  fieldName: string = 'file'
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    
    const formData = new FormData()
    formData.append(fieldName, file)
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    
    const result = await response.json()
    
    if (response.ok && result.success) {
      return { success: true, data: result.data }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error) {
    return { success: false, error: { message: 'Upload failed', details: error } }
  }
}

/**
 * Upload a profile image (trainer)
 * @param file - The image file to upload
 * @returns Promise with the upload response
 */
export async function uploadProfileImage(file: File) {
  return uploadFile(file, '/trainer/settings/profile-image', 'profileImage')
}

/**
 * Upload a user profile image
 * @param file - The image file to upload
 * @returns Promise with the upload response
 */
export async function uploadUserProfileImage(file: File) {
  return uploadFile(file, '/user/profile/profile-image', 'profileImage')
}

/**
 * Upload content file (video, image, document)
 * @param file - The file to upload
 * @returns Promise with the upload response
 */
export async function uploadContentFile(file: File) {
  return uploadFile(file, '/trainer/upload/content', 'file')
}

/**
 * Upload thumbnail image
 * @param file - The thumbnail image file to upload
 * @returns Promise with the upload response
 */
export async function uploadThumbnail(file: File) {
  return uploadFile(file, '/trainer/upload/thumbnail', 'file')
}

/**
 * Remove a profile image (trainer)
 * @returns Promise with the removal response
 */
export async function removeProfileImage(): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    
    const response = await fetch(`${baseUrl}/trainer/settings/profile-image`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    
    const result = await response.json()
    
    if (response.ok && result.success) {
      return { success: true, data: result.data }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error) {
    return { success: false, error: { message: 'Removal failed', details: error } }
  }
}

/**
 * Remove a user profile image
 * @returns Promise with the removal response
 */
export async function removeUserProfileImage(): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    
    const response = await fetch(`${baseUrl}/user/profile/profile-image`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    
    const result = await response.json()
    
    if (response.ok && result.success) {
      return { success: true, data: result.data }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error) {
    return { success: false, error: { message: 'Removal failed', details: error } }
  }
}

/**
 * Validate file size
 * @param file - The file to validate
 * @param maxSizeMB - Maximum size in MB
 * @returns Object with validation result
 */
export function validateFileSize(file: File, maxSizeMB: number): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  
  if (file.size > maxSizeBytes) {
    return { 
      valid: false, 
      error: `File size must be less than ${maxSizeMB}MB` 
    }
  }
  
  return { valid: true }
}

/**
 * Validate image file type
 * @param file - The file to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns Object with validation result
 */
export function validateImageType(
  file: File, 
  allowedTypes: readonly string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Only ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} images are allowed` 
    }
  }
  
  return { valid: true }
}

/**
 * Validate file type for content uploads
 * @param file - The file to validate
 * @param contentType - The content type (video, image, document)
 * @returns Object with validation result
 */
export function validateContentFileType(file: File, contentType: string): { valid: boolean; error?: string } {
  const allowedTypes: Record<string, readonly string[]> = {
    video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'],
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
  }
  
  const types = allowedTypes[contentType] || []
  
  if (types.length === 0) {
    return { valid: false, error: `Unknown content type: ${contentType}` }
  }
  
  if (!types.includes(file.type)) {
    return { 
      valid: false, 
      error: `Only ${types.map(t => t.split('/')[1].toUpperCase()).join(', ')} files are allowed for ${contentType} content` 
    }
  }
  
  return { valid: true }
}

/**
 * Get file size in human readable format
 * @param bytes - File size in bytes
 * @returns Human readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get file extension from filename
 * @param filename - The filename
 * @returns File extension (without dot)
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Check if file is an image
 * @param file - The file to check
 * @returns True if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * Check if file is a video
 * @param file - The file to check
 * @returns True if file is a video
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/')
}

/**
 * Check if file is an audio file
 * @param file - The file to check
 * @returns True if file is an audio file
 */
export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/')
}

/**
 * Generate a preview URL for a file
 * @param file - The file to preview
 * @returns Object URL for preview
 */
export function createFilePreview(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Revoke a file preview URL to free memory
 * @param url - The object URL to revoke
 */
export function revokeFilePreview(url: string): void {
  URL.revokeObjectURL(url)
}

/**
 * Default file size limits for different upload types
 */
export const FILE_SIZE_LIMITS = {
  PROFILE_IMAGE: 10, // 10MB
  CONTENT_FILE: 500, // 500MB
  THUMBNAIL: 10, // 10MB
} as const

/**
 * Default allowed file types for different content types
 */
export const ALLOWED_FILE_TYPES = {
  PROFILE_IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'],
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  AUDIO: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
} as const

/**
 * Upload a gallery image for trainer site
 * @param file - The image file to upload
 * @param caption - Optional caption for the image
 * @returns Promise with the upload response
 */
export async function uploadGalleryImage(
  file: File,
  caption?: string
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    
    const formData = new FormData()
    formData.append('image', file)
    if (caption) {
      formData.append('caption', caption)
    }
    
    const response = await fetch(`${baseUrl}/trainer/site/gallery`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    
    const result = await response.json()
    
    if (response.ok && result.success) {
      return { success: true, data: result.data }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error) {
    return { success: false, error: { message: 'Upload failed', details: error } }
  }
}

/**
 * Upload a hero background image for trainer site
 * @param file - The image file to upload
 * @returns Promise with the upload response
 */
export async function uploadHeroBackground(
  file: File
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await fetch(`${baseUrl}/trainer/site/hero-background`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    
    const result = await response.json()
    
    if (response.ok && result.success) {
      return { success: true, data: result.data }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error) {
    return { success: false, error: { message: 'Upload failed', details: error } }
  }
}