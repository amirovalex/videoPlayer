import React, { useRef, useState, useEffect } from 'react'
import './Trimbar.css'

type Props = {
  duration: number
  trimStart: number
  trimEnd: number
  setTrimStart: (t: number) => void
  setTrimEnd: (t: number) => void
  thumbnails: string[]
  pauseVideo: () => void
  startVideo: () => void
}

export default function TrimBar({
  duration,
  trimStart,
  trimEnd,
  setTrimStart,
  setTrimEnd,
  thumbnails,
  pauseVideo,
  startVideo
}: Props) {
  // Reference to the main bar element, used for measuring width and position
  const barRef = useRef<HTMLDivElement>(null)

  // Tracks what part of the trim bar is being dragged: start-handle, end-handle, or the whole selection
  const [dragType, setDragType] = useState<'start' | 'end' | 'move' | null>(null)

  // When dragging the selection, store initial trimStart, trimEnd, and mouse X to compute shifts
  const initial = useRef<{ start: number; end: number; x: number } | null>(null)

  // True if the selection covers the entire duration — disables the “move” drag
  const fullRange = trimStart === 0 && trimEnd === duration

  // Convert a time value (seconds) into a percentage of the bar width
  const pct = (value: number) => (value / duration) * 100
  const startPct = pct(trimStart)
  const endPct = pct(trimEnd)

  const formatTime = (s: number) => new Date(s * 1000).toISOString().substr(14, 5)

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!dragType || !barRef.current) return
      const rect = barRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
      const time = (x / rect.width) * duration

      if (dragType === 'start' && time < trimEnd) {
        setTrimStart(time)
      } else if (dragType === 'end' && time > trimStart) {
        setTrimEnd(time)
      } else if (dragType === 'move' && initial.current) {
        const delta = e.clientX - initial.current.x
        const shift = (delta / rect.width) * duration
        let newStart = initial.current.start + shift
        let newEnd = initial.current.end + shift

        if (newStart < 0) {
          newStart = 0
          newEnd = initial.current.end - initial.current.start
        } else if (newEnd > duration) {
          newEnd = duration
          newStart = duration - (initial.current.end - initial.current.start)
        }
        setTrimStart(newStart)
        setTrimEnd(newEnd)
      }
    }

    // When mouse is released, stop dragging and resume playback
    const handleUp = () => {
      if (!dragType) return
      setDragType(null)
      startVideo()
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [dragType, duration, trimStart, trimEnd, startVideo, setTrimStart, setTrimEnd])


  /**
     * Called on mousedown of handles or selection region.
     * - Pauses video playback
     * - Sets which drag operation to perform
     * - If moving the whole region, capture initial positions
   */
  const onMouseDown = (type: 'start' | 'end' | 'move', e?: React.MouseEvent) => {
    // Prevent “move” drag when full range is selected
    if (type === 'move' && fullRange) return
    
    pauseVideo()
    setDragType(type)
    if (type === 'move' && e) {
      initial.current = { start: trimStart, end: trimEnd, x: e.clientX }
    }
  }

  return (
    <div ref={barRef} className="trim-bar">
      <div className="trim-bar-thumbnails">
        {thumbnails.map((src, i) => (
          <div key={i} className="trim-bar-thumbnail">
            <img src={src} alt={`thumb-${i}`} />
          </div>
        ))}
      </div>

      <div className="trim-bar-dimmed" style={{ width: `${startPct}%` }} />
      <div className="trim-bar-dimmed" style={{ left: `${endPct}%`, right: 0 }} />

      <div
        className={`trim-bar-selection${fullRange ? ' no-drag' : ''}`}
        style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
        onMouseDown={e => onMouseDown('move', e)}
      />

      <div
        className="trim-bar-handle"
        style={{ left: `calc(${startPct}% - 4px)` }}
        onMouseDown={() => onMouseDown('start')}
      />

      <div
        className="trim-bar-handle"
        style={{ left: `calc(${endPct}% - 4px)` }}
        onMouseDown={() => onMouseDown('end')}
      />

      <div className="trim-bar-time" style={{ left: `calc(${endPct}% - 30px)` }}>
        {formatTime(trimEnd)}
      </div>
    </div>
  )
}
