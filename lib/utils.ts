export const SUPPORTED_EXTENSIONS = ['txt', 'md']

export function isValidUploadFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return SUPPORTED_EXTENSIONS.includes(ext)
}

export function filenameToTitle(filename: string): string {
  return filename.replace(/\.(txt|md)$/i, '')
}

export function plainTextToHtml(text: string): string {
  return text
    .split('\n')
    .map((line) => `<p>${line || '<br>'}</p>`)
    .join('')
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
