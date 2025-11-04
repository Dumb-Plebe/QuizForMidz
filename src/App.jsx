import SimpleCounter from "./SimpleCounter.jsx"
import CounterContainer from "./CounterContainer.jsx"
import DataStorage from "./DataStorage.jsx"
import GameOfLifeContainer from "./GameOfLifeContainer.jsx"
import TextTransformContainer from "./TextTransformContainer.jsx"

// The data-text="new" attribute is important - it tells the
// CSS what text to display for the pseudo-elements
// (::before and ::after) that create the colored ghost
// effects.

export default function App() {
  return (
  <div>
    <h1>Hello from React!</h1>
    <p> This is my <span className="glitch-text" data-text="new">new</span> website! </p>

    <div className="explainer-box">
      <p>These buttons keeps track of their own state:</p>
        <SimpleCounter />
        <br /><br />
        <SimpleCounter />
    </div>

    <div className="explainer-box">
      <p>These buttons share state:</p>
        <CounterContainer />
    </div>

    <div className="explainer-box">
      <p>This component saves/loads data to the server:</p>
        <DataStorage />
    </div>

    <div className="explainer-box">
      <p>This text updates automatically:</p>
        <TextTransformContainer />
    </div>

    <div className="explainer-box">
      <p>
        Here's the Game of Life. Click a cell to toggle it.
        Live cell with 2-3 neighbors survives. Live cell with &lt;2 or  &gt;3 neighbors dies.
        Dead cell with exactly 3 neighbors becomes alive.
      </p>
        <GameOfLifeContainer gridSize={15} />
    </div>

  </div>
  );
}