'use client'

export function ColorSwatch({
  label,
  value,
  onChange,
  presets,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  presets: string[]
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--mute)]">{label}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {presets.map((color) => (
          <button
            key={color}
            type="button"
            title={color}
            onClick={() => onChange(color)}
            className="w-6 h-6 rounded-lg transition-transform hover:scale-110 focus:outline-none"
            style={{
              backgroundColor: color,
              boxShadow:
                value.toLowerCase() === color.toLowerCase()
                  ? '0 0 0 2px #fff, 0 0 0 3px var(--brand)'
                  : '0 0 0 1px rgba(20,18,14,0.18)',
            }}
          />
        ))}
        {/* Custom color */}
        <label
          title="Custom color"
          className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
          style={{
            background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
            boxShadow: '0 0 0 1px rgba(20,18,14,0.18)',
          }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  )
}
