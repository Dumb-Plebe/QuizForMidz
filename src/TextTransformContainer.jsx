import { useState } from 'react'
import TextInput from './TextInput.jsx'
import ReversedText from './ReversedText.jsx'
import MorseCode from './MorseCode.jsx'
import PigLatin from './PigLatin.jsx'

export default function TextTransformContainer() {
  const [text, setText] = useState('')

  return (
    <div>
      <div className="transform-section">
        <label className="transform-label">
          Input:
        </label>
        <TextInput
          value={text}
          onChange={setText}
          placeholder="Text please..."
        />
      </div>
      <div className="transform-section">
        <ReversedText text={text} />
      </div>
      <div className="transform-section">
        <MorseCode text={text} />
      </div>
      <div>
        <PigLatin text={text} />
      </div>
    </div>
  )
}