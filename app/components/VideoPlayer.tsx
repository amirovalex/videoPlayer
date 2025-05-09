'use client'
import React, { useRef, useState, useEffect } from 'react'
import TrimBar from './TrimBar'
import Timeline from './Timeline'
import { extractCanvasThumbnails } from '../utils/utils' // adjust path
import './VideoPlayer.css'

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [trimStart, setTrimStart] = useState(0)
  const [ended, setEnded] = useState(false)
  const [trimEnd, setTrimEnd] = useState(0)
  const [thumbnails, setThumbnails] = useState<string[]>([])

  // Seek the video to a specific time.
  const handleCurrentTime = (t:number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = t
    }
  }

  // Initialize duration and keep currentTime in sync on playback
  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    setDuration(vid.duration)

    const updateTime = () => setCurrentTime(vid.currentTime)
    vid.addEventListener('timeupdate', updateTime)
    return () => vid.removeEventListener('timeupdate', updateTime)
  }, [])

   //Toggle between playing and pausing.If the video has already ended, restart it at trimStart.
  const togglePlay = () => {
    const vid = videoRef.current
    if (!vid) return

    if (vid.paused) {
      vid.play()
      setIsPlaying(true)
      if (ended) {
      vid.currentTime = trimStart
      setEnded(false)
    }
    } else {
      vid.pause()
      setIsPlaying(false)
    }
  }

  //Handler called when playback reaches the end.
  const onEnded = () => {
    setIsPlaying(false)
    setEnded(true)
  }

  //Mute or unmute the video
  const toggleMute = () => {
    const vid = videoRef.current
    if (!vid) return
    vid.muted = !vid.muted
    setIsMuted(vid.muted)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Pre-generate thumbnail images for the timeline scrubber
  useEffect(() => {
    extractCanvasThumbnails('/sample.mp4').then(setThumbnails)
  }, [])

  // Start video on trimStart and end on trimEnd during playback
  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return

    const updateTime = () => {
      let t = vid.currentTime

      if (t < trimStart) {
        vid.currentTime = trimStart
        t = trimStart
      }

      if (t >= trimEnd) {
        vid.pause()
        setEnded(true)
        setIsPlaying(false)
        t = trimEnd
      }

      setCurrentTime(t)
    }

    vid.addEventListener('timeupdate', updateTime)
    return () => vid.removeEventListener('timeupdate', updateTime)
  }, [trimStart, trimEnd])

    useEffect(() => {
      setTrimEnd(videoRef.current?.duration || 0)
    }, [videoRef])

  //Setting the trimStart
  const handleTrimStart = (time: number) => {
    setTrimStart(time)
    setCurrentTime(time)
  }

  const pauseVideo = () => {
    const vid = videoRef.current
    if (!vid) return
    vid.pause()
    setIsPlaying(false)
  }

  const startVideo = () => {
    const vid = videoRef.current
    if (!vid) return
    vid.currentTime = trimStart
    vid.play()
    setIsPlaying(true)
  }

  return (
  <div className="video-player">
      <div className="video-player-video-container">
        <video
          ref={videoRef}
          src="/sample.mp4"
          className="video-player-video"
          muted={isMuted}
          onEnded={onEnded}
        />
        <Timeline
          trimEnd={trimEnd}
          trimStart={trimStart}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleCurrentTime}
          isMuted={isMuted}
          isPlaying={isPlaying}
          toggleMute={toggleMute}
          togglePlay={togglePlay}
          formatTime={formatTime}
        />
      </div>

      <TrimBar
        duration={duration}
        trimStart={trimStart}
        trimEnd={trimEnd}
        setTrimStart={handleTrimStart}
        setTrimEnd={setTrimEnd}
        pauseVideo={pauseVideo}
        startVideo={startVideo}
        thumbnails={thumbnails}
      />
    </div>
  )
}
