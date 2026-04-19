import { isValidUploadFile, filenameToTitle, plainTextToHtml } from '@/lib/utils'

describe('isValidUploadFile', () => {
  it('accepts .txt files', () => {
    expect(isValidUploadFile('notes.txt')).toBe(true)
  })
  it('accepts .md files', () => {
    expect(isValidUploadFile('README.md')).toBe(true)
  })
  it('rejects .docx files', () => {
    expect(isValidUploadFile('report.docx')).toBe(false)
  })
  it('rejects .pdf files', () => {
    expect(isValidUploadFile('doc.pdf')).toBe(false)
  })
  it('is case-insensitive', () => {
    expect(isValidUploadFile('file.TXT')).toBe(true)
  })
})

describe('filenameToTitle', () => {
  it('strips .txt extension', () => {
    expect(filenameToTitle('my-notes.txt')).toBe('my-notes')
  })
  it('strips .md extension', () => {
    expect(filenameToTitle('README.md')).toBe('README')
  })
  it('leaves filenames without known extension unchanged', () => {
    expect(filenameToTitle('nodot')).toBe('nodot')
  })
})

describe('plainTextToHtml', () => {
  it('wraps each line in a paragraph', () => {
    const html = plainTextToHtml('Hello\nWorld')
    expect(html).toBe('<p>Hello</p><p>World</p>')
  })
  it('converts empty lines to line breaks', () => {
    const html = plainTextToHtml('Hello\n\nWorld')
    expect(html).toContain('<p><br></p>')
  })
})
