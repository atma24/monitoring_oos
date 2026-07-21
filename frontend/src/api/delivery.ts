import client from './client'

export async function uploadDelivery(file: File) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await client.post('/delivery/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
