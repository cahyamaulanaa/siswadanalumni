/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/js/**/*.{jsx,js}',
    './resources/views/**/*.blade.php',
  ],
  safelist: [
    // Slate colors
    'bg-slate-900',
    'bg-slate-800',
    'text-slate-900',
    'text-slate-600',
    // Blue colors
    'from-blue-400',
    'from-blue-500',
    'from-blue-600',
    'to-blue-500',
    'to-blue-600',
    'to-blue-700',
    'bg-blue-400',
    'bg-blue-500',
    'bg-blue-600',
    'hover:from-blue-600',
    'hover:to-blue-700',
    'focus:ring-blue-400',
    'text-blue-300',
    // Purple colors
    'bg-purple-500',
    'bg-purple-600',
    'bg-purple-700',
    'to-purple-600',
    'from-purple-600',
    'hover:to-purple-700',
    'focus:ring-purple-400',
    'text-purple-300',
    // Pink colors
    'bg-pink-500',
    'text-pink-300',
    // Red colors
    'bg-red-500',
    'border-red-400',
    'text-red-200',
    'text-red-700',
    'bg-red-100',
    // Gray/white
    'text-white',
    'text-white/90',
    'text-white/60',
    'text-white/30',
    'text-white/20',
    'text-white/10',
    'bg-white',
    'bg-white/10',
    'bg-white/15',
    'bg-white/20',
    'bg-white/5',
    'border-white/20',
    'border-white/10',
    'border-white/30',
    'text-gray-300',
    'text-gray-400',
    'text-gray-500',
    'text-gray-600',
    'text-gray-700',
    // Animations and effects
    'animate-blob',
    'animate-pulse',
    'animate-spin',
    'backdrop-blur-xl',
    'blur-3xl',
    'mix-blend-multiply',
    'filter',
    'shadow-lg',
    'shadow-xl',
    'shadow-2xl',
    // Other utilities
    'scale-105',
    'active:scale-95',
    'hover:scale-105',
    'hover:bg-white/10',
  ],
  theme: {
    extend: {
      animation: {
        blob: 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        }
      }
    },
  },
  plugins: [],
}
