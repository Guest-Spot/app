export default function useImage() {
  /**
   * Converts a File object to base64 string
   * @param file - File object to convert
   * @returns Promise<string> - base64 string representation of the file
   */
  const formatFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to convert file to base64'))
        }
      }
      reader.onerror = () => reject(new Error(reader.error?.message || 'Failed to read file'))
    })
  }

  return {
    formatFileToBase64
  }
}
