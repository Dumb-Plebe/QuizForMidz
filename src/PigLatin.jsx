export default function PigLatin({ text }) {
  const convertToPigLatin = (text) => {
    const vowels = ['a', 'e', 'i', 'o', 'u']

    return text
      .split(' ')
      .map(word => {
        if (!word) return word

        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '')
        if (!cleanWord) return word

        const firstChar = cleanWord[0]

        if (vowels.includes(firstChar)) {
          // Words starting with vowels: add "way"
          return word.replace(/[a-zA-Z]+/, cleanWord + 'way')
        } else {
          // Words starting with consonants: move consonant cluster to end and add "ay"
          let consonantCluster = ''
          let i = 0

          while (i < cleanWord.length && !vowels.includes(cleanWord[i])) {
            consonantCluster += cleanWord[i]
            i++
          }

          const remainingWord = cleanWord.slice(i)
          return word.replace(/[a-zA-Z]+/, remainingWord + consonantCluster + 'ay')
        }
      })
      .join(' ')
  }

  const pigLatinText = convertToPigLatin(text)

  return (
    <div>
      <label className="transform-label">
        Pig Latin:
      </label>
      <div>
        {pigLatinText || <span className="transform-placeholder">Pig Latin will appear here...</span>}
      </div>
    </div>
  )
}