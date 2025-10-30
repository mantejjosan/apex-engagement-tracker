'use client'

export default function TapCard({ eventName, description, selected = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-3 rounded-lg text-left transition-all
        ${selected 
          ? 'bg-amber-50 border-2 border-amber-500 shadow-md' 
          : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${selected ? 'text-amber-700' : 'text-gray-800'}`}>
            {eventName}
          </h4>
          {description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>
        <div className={`
          flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
          ${selected 
            ? 'bg-amber-500 border-amber-500' 
            : 'bg-white border-gray-300'
          }
        `}>
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  )
}

/* 
USAGE:
<TapCard 
  eventName="Coding Competition"
  description="Build the best app in 24 hours"
  selected={true}
  onClick={() => toggleEvent(eventId)}
/>
*/