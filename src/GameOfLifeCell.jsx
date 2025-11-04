export default function GameOfLifeCell({ grid, onCellClick, gridSize }) {
  return (
    <div
      className="game-of-life-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gap: '1px',
        width: 'fit-content',
        border: '2px solid #333'
      }}
    >
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`game-cell ${cell ? 'alive' : 'dead'}`}
            onClick={() => onCellClick(rowIndex, colIndex)}
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: cell ? '#000' : '#fff',
              border: '1px solid #ccc',
              cursor: 'pointer'
            }}
          />
        ))
      )}
    </div>
  )
}