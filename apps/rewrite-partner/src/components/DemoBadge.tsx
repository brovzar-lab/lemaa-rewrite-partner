export function DemoBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: '#EBF2F8',
        color: '#3D6B8E',
        border: '1px solid #B8D4E8',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse-soft"
        style={{ backgroundColor: '#3D6B8E' }}
      />
      Demo Mode
    </span>
  )
}
