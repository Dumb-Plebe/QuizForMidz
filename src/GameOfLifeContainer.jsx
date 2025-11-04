import { useState, useEffect, useCallback } from 'react'
import GameOfLifeCell from './GameOfLifeCell.jsx'

export default function GameOfLifeContainer({ gridSize = 20 }) {
  const [grid, setGrid] = useState([])

  // Initialize empty grid
  const createEmptyGrid = useCallback((size) => {
    return Array(size).fill().map(() => Array(size).fill(false))
  }, [])

  // Initialize grid on mount or size change
  useEffect(() => {
    setGrid(createEmptyGrid(gridSize))
  }, [gridSize, createEmptyGrid])

  // Game of Life rules
  const getNextGeneration = useCallback((currentGrid) => {
    const newGrid = currentGrid.map(arr => [...arr])

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        let neighbors = 0

        // Count living neighbors
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue
            const newRow = row + i
            const newCol = col + j
            if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
              if (currentGrid[newRow][newCol]) neighbors++
            }
          }
        }

        // Apply Game of Life rules
        if (currentGrid[row][col]) {
          // Cell is alive
          if (neighbors < 2 || neighbors > 3) {
            newGrid[row][col] = false // Dies
          }
        } else {
          // Cell is dead
          if (neighbors === 3) {
            newGrid[row][col] = true // Becomes alive
          }
        }
      }
    }

    return newGrid
  }, [gridSize])

  // Timer effect for automatic updates
  useEffect(() => {
    const interval = setInterval(() => {
      setGrid(currentGrid => getNextGeneration(currentGrid))
    }, 3000)

    return () => clearInterval(interval)
  }, [getNextGeneration])

  // Handle cell click
  const handleCellClick = (row, col) => {
    setGrid(currentGrid => {
      const newGrid = currentGrid.map(arr => [...arr])
      newGrid[row][col] = !newGrid[row][col]
      return newGrid
    })
  }

  // Random grid
  const randomizeGrid = () => {
    setGrid(createEmptyGrid(gridSize).map(row =>
      row.map(() => Math.random() > 0.7)
    ))
  }

  return (
    <div>
      <h3>Conway's Game of Life</h3>
      <button onClick={randomizeGrid} style={{ marginBottom: '10px' }}>
        Randomize
      </button>
      <GameOfLifeCell
        grid={grid}
        onCellClick={handleCellClick}
        gridSize={gridSize}
      />
      <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
        Click cells to toggle them
      </p>
    </div>
  )
}