export function NexusLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nexus-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="50%" stopColor="#5200FF" />
          <stop offset="100%" stopColor="#FF0080" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer Ring with Flow Effect */}
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill="none" 
        stroke="url(#nexus-gradient)" 
        strokeWidth="2"
        filter="url(#glow)"
        opacity="0.8"
      >
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0 50 50"
          to="360 50 50"
          dur="8s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* Central Nexus Core */}
      <circle 
        cx="50" 
        cy="50" 
        r="18" 
        fill="url(#nexus-gradient)"
        filter="url(#glow)"
      />
      
      {/* Flow Lines */}
      <g stroke="url(#nexus-gradient)" strokeWidth="2" fill="none" opacity="0.6">
        <path d="M20 30 Q50 20 80 30" strokeLinecap="round">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M20 70 Q50 80 80 70" strokeLinecap="round">
          <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M30 20 Q20 50 30 80" strokeLinecap="round">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
        </path>
        <path d="M70 20 Q80 50 70 80" strokeLinecap="round">
          <animate attributeName="opacity" values="1;0.6;1" dur="2.5s" repeatCount="indefinite" />
        </path>
      </g>
      
      {/* Energy Particles */}
      <g fill="url(#nexus-gradient)">
        <circle cx="25" cy="25" r="2">
          <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 50,50; 0,0"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="75" cy="25" r="2">
          <animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="indefinite" />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -50,50; 0,0"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="25" cy="75" r="2">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 50,-50; 0,0"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="75" cy="75" r="2">
          <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -50,-50; 0,0"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    </svg>
  );
}

export function NexusWordmark({ className = "text-2xl" }: { className?: string }) {
  return (
    <div className={`font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent ${className}`}>
      NexusFlow
    </div>
  );
}