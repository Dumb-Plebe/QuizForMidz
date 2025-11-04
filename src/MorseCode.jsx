export default function MorseCode({ text }) {
  const morseCodeMap = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
    '9': '----.', '0': '-----', ' ': '/'
  }

  const convertToMorse = (text) => {
    return text
      .toUpperCase()
      .split('')
      .map(char => morseCodeMap[char] || char)
      .join(' ')
  }

  const morseText = convertToMorse(text)

  return (
    <div>
      <label className="transform-label">
        Morse Code:
      </label>
      <div>
        {morseText || <span className="transform-placeholder">Morse code will appear here...</span>}
      </div>
    </div>
  )
}