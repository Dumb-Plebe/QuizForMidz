// This is based on this section:
// https://react.dev/learn#sharing-data-between-components

import { useState } from 'react';

export default function CounterContainer() {
    
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <div>
      <MyButton count={count} onClick={handleClick} />
      <br/><br/>
      <MyButton count={count} onClick={handleClick} />
    </div>
  );

}



function MyButton({ count, onClick }) {
  return (
    <button onClick={onClick}>
      Clicked {count} times
    </button>
  );
}