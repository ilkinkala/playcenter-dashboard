export default function FoxLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left ear outer */}
      <path d="M8 4L18 26L10 30L18 26Z" fill="#E8551E"/>
      <path d="M8 4L18 26C14 28 12 30 14 34L8 4Z" fill="#FF6B35"/>
      {/* Right ear outer */}
      <path d="M56 4L46 26L54 30L46 26Z" fill="#E8551E"/>
      <path d="M56 4L46 26C50 28 52 30 50 34L56 4Z" fill="#FF6B35"/>
      {/* Left ear inner */}
      <path d="M12 10L19 26L15 28L12 10Z" fill="#FFB088"/>
      {/* Right ear inner */}
      <path d="M52 10L45 26L49 28L52 10Z" fill="#FFB088"/>
      {/* Head shape */}
      <ellipse cx="32" cy="36" rx="20" ry="18" fill="#FF6B35"/>
      {/* Cheek fur left */}
      <path d="M12 34C12 34 10 38 12 42C14 46 18 48 22 48" fill="#E8551E"/>
      {/* Cheek fur right */}
      <path d="M52 34C52 34 54 38 52 42C50 46 46 48 42 48" fill="#E8551E"/>
      {/* White face patch */}
      <path d="M22 34C22 34 24 26 32 26C40 26 42 34 42 34C42 34 42 46 38 50C36 52 28 52 26 50C22 46 22 34 22 34Z" fill="#FFF5EE"/>
      {/* Forehead darker */}
      <path d="M20 30C20 30 24 22 32 22C40 22 44 30 44 30C44 32 40 28 32 28C24 28 20 32 20 30Z" fill="#E8551E"/>
      {/* Left eye */}
      <ellipse cx="26" cy="35" rx="2.8" ry="3" fill="#2D3047"/>
      <ellipse cx="26.8" cy="34" rx="1.2" ry="1.4" fill="#4a4a6a"/>
      <circle cx="27.2" cy="33.5" r="0.9" fill="white"/>
      <circle cx="25.5" cy="35.5" r="0.4" fill="white" opacity="0.5"/>
      {/* Right eye */}
      <ellipse cx="38" cy="35" rx="2.8" ry="3" fill="#2D3047"/>
      <ellipse cx="38.8" cy="34" rx="1.2" ry="1.4" fill="#4a4a6a"/>
      <circle cx="39.2" cy="33.5" r="0.9" fill="white"/>
      <circle cx="37.5" cy="35.5" r="0.4" fill="white" opacity="0.5"/>
      {/* Nose */}
      <ellipse cx="32" cy="41" rx="2.5" ry="1.8" fill="#2D3047"/>
      <ellipse cx="32" cy="40.5" rx="1.2" ry="0.6" fill="#4a4a6a" opacity="0.5"/>
      {/* Mouth */}
      <path d="M32 42.8L29.5 44.5" stroke="#2D3047" strokeWidth="0.8" strokeLinecap="round"/>
      <path d="M32 42.8L34.5 44.5" stroke="#2D3047" strokeWidth="0.8" strokeLinecap="round"/>
      {/* Whisker dots */}
      <circle cx="24" cy="42" r="0.5" fill="#E8551E"/>
      <circle cx="22" cy="41" r="0.5" fill="#E8551E"/>
      <circle cx="22.5" cy="43.5" r="0.5" fill="#E8551E"/>
      <circle cx="40" cy="42" r="0.5" fill="#E8551E"/>
      <circle cx="42" cy="41" r="0.5" fill="#E8551E"/>
      <circle cx="41.5" cy="43.5" r="0.5" fill="#E8551E"/>
    </svg>
  );
}
