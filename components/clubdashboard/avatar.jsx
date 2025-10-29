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

  // Calculate initials from name
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

  // Generate random pastel color based on initials
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

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && (name || institute || points > 0) && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg whitespace-nowrap z-10">
          {name && <div className="font-semibold">{name}</div>}
          {institute && <div className="text-xs opacity-80">{institute}</div>}
          {points > 0 && <div className="text-yellow-400 font-bold">{points} points</div>}
          {/* Tooltip arrow */}
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

// Demo
function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-8">Student Avatar Component</h1>
        
        {/* Size variants */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Sizes</h2>
          <div className="flex items-center gap-4">
            <StudentAvatar 
              size="sm" 
              name="Alice" 
              institute="GNDEC" 
              points={120}
            />
            <StudentAvatar 
              size="md" 
              name="Bob Kumar" 
              institute="GNDEC" 
              points={250}
            />
            <StudentAvatar 
              size="lg" 
              name="Charlie" 
              institute="GNDEC" 
              points={180}
            />
            <StudentAvatar 
              size="xl" 
              name="David Singh" 
              institute="GNDEC" 
              points={320}
            />
          </div>
        </div>

        {/* With checkmarks */}
        <div>
          <h2 className="text-xl font-semibold mb-4">With Check Marks</h2>
          <div className="flex items-center gap-4">
            <StudentAvatar 
              size="sm" 
              name="Alice" 
              institute="GNDEC" 
              points={120}
              checkMark={true}
            />
            <StudentAvatar 
              size="md" 
              name="Krishna Patel" 
              institute="Punjab Engineering College" 
              points={250}
              checkMark={true}
            />
            <StudentAvatar 
              size="lg" 
              name="Mandeep" 
              institute="GNDEC Ludhiana" 
              points={180}
              checkMark={true}
            />
          </div>
        </div>

        {/* Different names for color variety */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Color Variety</h2>
          <div className="flex items-center gap-4">
            <StudentAvatar name="Alice" institute="GNDEC" points={100} />
            <StudentAvatar name="Bob" institute="GNDEC" points={200} />
            <StudentAvatar name="Charlie" institute="GNDEC" points={150} />
            <StudentAvatar name="David" institute="GNDEC" points={300} />
            <StudentAvatar name="Emma" institute="GNDEC" points={250} />
            <StudentAvatar name="Frank" institute="GNDEC" points={180} />
            <StudentAvatar name="Grace" institute="GNDEC" points={220} />
            <StudentAvatar name="Henry" institute="GNDEC" points={190} />
          </div>
        </div>

        {/* Hover message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            💡 <strong>Tip:</strong> Hover over any avatar to see the tooltip with name, institute, and points!
          </p>
        </div>
      </div>
    </div>
  );
}