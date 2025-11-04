export default function TextInput({ value, onChange, placeholder = "Type something..." }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="text-input"
    />
  )
}