import React, { useState } from 'react';

export function AddTodo ({handleAddTodo}) {
  const [value, setValue] = useState();
  return <div>
    <input type="text" value={value} onChange={ev => setValue(ev.target.value)} />
    <button type="button" onClick={() => handleAddTodo(value)}>Add Todo</button>
  </div>;
}
