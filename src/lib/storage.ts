// Storage service for PDF reports using Supabase Storage

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export class StorageService {
  private static BUCKET_NAME = 'stream-reports'

  // Upload PDF to Supabase Storage and return public URL
  static async uploadPDF(filename: string, pdfBuffer: Buffer): Promise<string> {
    try {
      console.log('Uploading PDF to storage:', filename, 'size:', pdfBuffer.length, 'bytes')

      // First, try to create bucket if it doesn't exist (will fail silently if exists)
      try {
        await supabase.storage.createBucket(this.BUCKET_NAME, { public: false })
        console.log('Created storage bucket:', this.BUCKET_NAME)
      } catch (bucketError) {
        // Bucket might already exist, ignore error
        console.log('Bucket creation skipped (may already exist)')
      }

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filename, pdfBuffer, {
          contentType: 'application/pdf',
          cacheControl: '3600', // Cache for 1 hour
          upsert: true // Overwrite if exists
        })

      if (error) {
        console.error('Storage upload error:', error)
        throw error
      }

      console.log('PDF uploaded successfully:', data.path)

      // Generate a signed URL for secure download (expires in 7 days)
      const { data: urlData, error: urlError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(data.path, 7 * 24 * 60 * 60) // 7 days in seconds

      if (urlError) {
        console.error('Signed URL generation error:', urlError)
        throw urlError
      }

      console.log('Signed URL generated successfully')
      return urlData.signedUrl

    } catch (error) {
      console.error('PDF upload failed:', error)
      throw new Error('Failed to upload PDF to storage')
    }
  }

  // Clean up old PDFs (optional - run periodically)
  static async cleanupOldPDFs(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const { data: files, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1000 })

      if (error) {
        console.error('Failed to list files for cleanup:', error)
        return
      }

      const oldFiles = files?.filter(file => {
        const fileDate = new Date(file.created_at)
        return fileDate < cutoffDate
      })

      if (oldFiles && oldFiles.length > 0) {
        const filePaths = oldFiles.map(file => file.name)
        const { error: deleteError } = await supabase.storage
          .from(this.BUCKET_NAME)
          .remove(filePaths)

        if (deleteError) {
          console.error('Failed to delete old files:', deleteError)
        } else {
          console.log(`Cleaned up ${oldFiles.length} old PDF files`)
        }
      }
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  }

  // Get file info (for debugging/monitoring)
  static async getFileInfo(filename: string) {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { search: filename })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to get file info:', error)
      return null
    }
  }
}