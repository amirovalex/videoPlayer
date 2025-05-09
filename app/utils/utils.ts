export async function extractCanvasThumbnails(videoUrl: string, count = 10): Promise<string[]> {
  const video = document.createElement('video')
  video.src = videoUrl
  video.crossOrigin = 'anonymous'
  video.muted = true
  video.preload = 'auto'
  video.playsInline = true

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve()
    video.onerror = () => reject(new Error('Failed to load video'))
  })

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  canvas.width = 160
  canvas.height = 90

  const thumbnails: string[] = []

  const step = video.duration / count

  for (let i = 0; i < count; i++) {
    const time = Math.min(i * step, video.duration - 0.1)

    await new Promise<void>((res) => {
      video.currentTime = time
      video.onseeked = () => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const thumb = canvas.toDataURL('image/jpeg')
        thumbnails.push(thumb)
        res()
      }
    })
  }

  return thumbnails
}
