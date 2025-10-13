export default function GlassCard({ children, className = "" }) {
    return (
      <div className={`
        glass glass-dark rounded-3xl p-8 shadow-2xl border-glow
        transform transition-all duration-300 hover:scale-[1.02]
        ${className}
      `}>
        {children}
      </div>
    )
  }