import React, { useState } from "react";
import { db } from "../db";
import { ErrorBoundary } from "./ErrorBoundrary";
import { ItemListComponent } from "./ItemListComponent";
import { ItemLoaderComponent } from "./ItemLoaderComponent";

export function App() {
  const [currentId, setCurrentId] = useState(1);
  return <ErrorBoundary>
    <div id="list">
      <h2>All items</h2>
      <ItemListComponent loadItems={async ()=> {
        console.log("Liading items...");
        try {
          const items = await db.items.toArray();
          console.log("got items", items);
          return items;
          } catch (ex) {
          console.error("Error loading items", ex);
          throw ex;
        }
      }} />
    </div>
    <div id="current">
        <h2>Current item</h2>
        <ErrorBoundary>
          <ItemLoaderComponent id={currentId} loadItem={(id: number)=>db.items.get(id)} />
        </ErrorBoundary>
    </div>
    <div id="controls">
      <button id="btnFirst" onClick={()=>setCurrentId(1)}>First</button>
      <button id="btnNext" onClick={()=>setCurrentId(prevId => prevId + 1)}>Next</button>
      <button id="btnInvalidKey" onClick={()=>setCurrentId(NaN)}>Select invalid key</button>
    </div>    
  </ErrorBoundary>;
}
