'use client'
import React from 'react'
import Image from 'next/image'
import "./Timeline.css"
type Props = {
  currentTime: number
  duration: number
  trimStart: number
  trimEnd: number
  onSeek: (time: number) => void
  isMuted: boolean
  isPlaying: boolean
  toggleMute: () => void
  togglePlay: () => void
  formatTime: (s: number) => string
}

export default function Timeline({
  currentTime,
  duration,
  trimStart,
  trimEnd,
  onSeek,
  isMuted,
  isPlaying,
  toggleMute,
  togglePlay,
  formatTime,
}: Props) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const ratio = clickX / rect.width
    const rawTime = ratio * duration
    const clamped = Math.max(trimStart, Math.min(trimEnd, rawTime))
    onSeek(clamped)
  }

  return (
        <div className="timeline">
      <div className="timeline-bar" onClick={handleClick}>
        <div className="timeline-bar-background" />
        <div
          className="timeline-bar-progress"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
      </div>
      <div className="timeline-controls">
        <button onClick={toggleMute} className="timeline-button">
          {isMuted ? (
            <Image src="soundOn.svg" width={20} height={20} alt="unmute" />
          ) : (
            <Image src="soundOff.svg" width={20} height={20} alt="mute" />
          )}
        </button>
        <button onClick={togglePlay} className="timeline-button">
          {isPlaying ? (
            <Image src="pause.svg" width={20} height={20} alt="pause" />
          ) : (
            <Image src="play.svg" width={20} height={20} alt="play" />
          )}
        </button>
        <div className="timeline-time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  )
}
