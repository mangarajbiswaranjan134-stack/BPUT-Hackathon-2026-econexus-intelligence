import React from 'react';
import { motion } from 'framer-motion';

interface EcoNexusLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export default function EcoNexusLogo({ size = 36, className = '', animate = true }: EcoNexusLogoProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.08, rotate: 3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title="EcoNexus Intelligence • Environmental IoT & AI Platform"
    >
      {/* Ambient Radial Backlight Glow */}
      <div 
        className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-red-600/40 via-rose-500/30 to-emerald-500/20 blur-md pointer-events-none"
        style={{ transform: 'scale(1.25)' }}
      />

      {/* SVG Bio-Cyber Nexus Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]"
      >
        <defs>
          {/* Crimson Energy Gradient */}
          <linearGradient id="ecoCrimsonGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>

          {/* Eco Flora Neon Gradient */}
          <linearGradient id="ecoLeafGrad" x1="24" y1="6" x2="42" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="60%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Core Sparkle Gradient */}
          <linearGradient id="nexusCoreGrad" x1="18" y1="18" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#fca5a5" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>

          {/* Shield Outline Glow */}
          <linearGradient id="shieldBorder" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Outer Hex-Shield Chassis */}
        <polygon
          points="24,3 41,12 41,34 24,45 7,34 7,12"
          fill="#140a0e"
          stroke="url(#shieldBorder)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Intersecting Cyber Node Ribbon (The Nexus Wing) */}
        <path
          d="M12 24 C12 16 18 10 26 10 C32 10 36 14 36 19 C36 24 30 26 24 26 C16 26 12 30 12 35 C12 38 15 41 20 41 C27 41 33 36 36 29"
          stroke="url(#ecoCrimsonGrad)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* The Eco Biosphere Leaf Loop (Upper Right Arch) */}
        <path
          d="M24 10 C30 10 38 14 38 22 C38 30 30 36 24 36 C24 30 28 22 36 18"
          stroke="url(#ecoLeafGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.92"
        />

        {/* Micro Telemetry Circuit Points */}
        <circle cx="24" cy="10" r="1.6" fill="#34d399" />
        <circle cx="36" cy="19" r="1.6" fill="#f87171" />
        <circle cx="12" cy="24" r="1.6" fill="#f87171" />
        <circle cx="20" cy="41" r="1.6" fill="#34d399" />

        {/* Central Luminous Intelligence Core */}
        <circle cx="24" cy="25" r="3.2" fill="url(#nexusCoreGrad)" />
        <circle cx="24" cy="25" r="5" stroke="#ef4444" strokeWidth="0.8" opacity="0.6" strokeDasharray="1.5 1.5">
          {animate && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 24 25"
              to="360 24 25"
              dur="6s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      </svg>
    </motion.div>
  );
}
