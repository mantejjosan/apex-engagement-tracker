import { Check } from "lucide-react";
import { useState } from "react";

export default function StudentAvatar({
  size = 'md',
  name = "",
  institute = "",
  points = 0,
  checkMark = false
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-xl',
    lg: 'w-20 h-20 text-2xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const checkMarkSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
    xl: 'w-8 h-8',
  };

  const checkIconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(name);

  const getAvatarColor = (initials) => {
    const colors = [
      'bg-pink-200 text-pink-700 border-pink-400',
      'bg-green-200 text-green-700 border-green-400',
      'bg-blue-200 text-blue-700 border-blue-400',
      'bg-purple-200 text-purple-700 border-purple-400',
      'bg-yellow-200 text-yellow-700 border-yellow-400',
      'bg-red-200 text-red-700 border-red-400',
      'bg-indigo-200 text-indigo-700 border-indigo-400',
      'bg-orange-200 text-orange-700 border-orange-400',
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Close tooltip when clicking outside (optional improvement)
  const handleDocumentClick = (e) => {
    if (!e.target.closest(".avatar-container")) {
      setShowTooltip(false);
    }
  };

  // Attach listener only when tooltip is open
  if (typeof window !== "undefined") {
    if (showTooltip) {
      document.addEventListener("click", handleDocumentClick);
    } else {
      document.removeEventListener("click", handleDocumentClick);
    }
  }

  return (
    <div
      className="relative inline-block avatar-container"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip((prev) => !prev)} // ✅ mobile/tap support
    >
      {/* Tooltip */}
      {showTooltip && (name || institute || points > 0) && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg whitespace-nowrap z-10">
          {name && <div className="font-semibold">{name}</div>}
          {institute && <div className="text-xs opacity-80">{institute}</div>}
          {points > 0 && (
            <div className="text-yellow-400 font-bold">{points} points</div>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-black"></div>
          </div>
        </div>
      )}

      {/* Avatar */}
      <div className="relative">
        <div
          className={`
            flex items-center justify-center rounded-full 
            border-3 font-bold
            ${sizeClasses[size]} 
            ${getAvatarColor(initials)}
          `}
        >
          {initials}
        </div>

        {/* Check Mark */}
        {checkMark && (
          <div
            className={`
              absolute -top-1 -right-1 
              bg-green-500 rounded-full 
              flex items-center justify-center
              border-2 border-white
              ${checkMarkSizes[size]}
            `}
          >
            <Check size={checkIconSizes[size]} className="text-white" strokeWidth={3} />
          </div>
        )}
      </div>
    </div>
  );
}
