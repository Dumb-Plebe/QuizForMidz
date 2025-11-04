export default function ReversedText({ text }) {
  const reversedText = text.split('').reverse().join('')

  return (
    <div>
      <label className="transform-label">
        Reversed:
      </label>
      <p>
      {reversedText || <span className="transform-placeholder">Reversed text will appear here...</span>}
      </p>
    </div>
  )
}