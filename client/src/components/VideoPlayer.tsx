import React, { useRef, useState, useEffect } from 'react';
import './VideoPlayer.css';

interface VideoPlayerProps {
  videoSrc: string;
  fallbackImage?: string;
  onSkip?: () => void;
  showSkipButton?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoSrc,
  fallbackImage = '/expert-photo.png',
  onSkip,
  showSkipButton = true,
  autoPlay = true,
  loop = false,
  className = '',
  style = {}
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoError, setIsVideoError] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);

  useEffect(() => {
    setIsVideoError(false);
    setIsVideoEnded(false);
  }, [videoSrc]);

  const handleVideoError = () => {
    console.log('[VideoPlayer] Video failed to load, showing fallback image');
    setIsVideoError(true);
  };

  const handleVideoEnded = () => {
    console.log('[VideoPlayer] Video ended');
    setIsVideoEnded(true);
    if (onSkip) {
      onSkip();
    }
  };

  const handleSkipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (onSkip) {
      onSkip();
    }
  };

  if (isVideoError || isVideoEnded) {
    return (
      <img 
        src={fallbackImage} 
        alt="Expert" 
        className={className}
        style={style}
        onError={(e) => { 
          (e.target as HTMLImageElement).style.display = 'none'; 
        }} 
      />
    );
  }

  return (
    <div className="video-player-wrapper" style={style}>
      <video
        ref={videoRef}
        className={`video-player ${className}`}
        autoPlay={autoPlay}
        loop={loop}
        muted
        playsInline
        onError={handleVideoError}
        onEnded={handleVideoEnded}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {showSkipButton && !isVideoEnded && (
        <button 
          className="video-skip-button" 
          onClick={handleSkipClick}
          aria-label="Skip video"
        >
          Skip
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;
