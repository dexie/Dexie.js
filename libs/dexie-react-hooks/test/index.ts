import React from "react";
import ReactDOM from "react-dom";
import { module, test, equiv, assert } from "qunit";
import { db } from "./db";
import { App } from "./components/App";
import { waitTilEqual } from "./utils/waitTilEqual";
import { waitTilOk } from "./utils/waitTilOk";

const div = document.createElement('div');

document.body.insertAdjacentHTML('beforeend', `<div style="margin-top: 300px;"></div>`);
document.body.appendChild(div);
ReactDOM.render(React.createElement(App), div);

module('useLiveQuery', {
  async beforeEach(assert) {
    const done = assert.async();
    try {
      console.log("Clearing database");
      await db.items.clear();
      console.log("Successfully cleared database");
    } finally {
      done();
    }
  },
});

test("List component is reacting to changes", async ()=>{
  // Add items:
  console.log("Putting items");
  await db.items.bulkPut([{
    id: 1,
    name: "Hello",
  }, {
    id: 2,
    name: "World"
  }]);
  console.log("after bulkPut");
  await waitTilEqual(
    ()=>div.querySelector("ul#itemList")?.textContent,
    "ID: 1Name: HelloID: 2Name: World",
    "The list should be populated"
  );

  // Remove an item:
  db.items.delete(2);
  await waitTilEqual(
    ()=>div.querySelector("ul#itemList")?.textContent,
    "ID: 1Name: Hello",
    "The second item should have been removed"
  );

  // Update an item:
  await db.items.update(1, {name: "Hola"});
  await waitTilEqual(
    ()=>div.querySelector("ul#itemList")?.textContent,
    "ID: 1Name: Hola",
    "The first item should have been updated");
});

test("ItemLoaderComponent is reacting to changes", async ()=>{
  const divCurrent = div.querySelector("div#current")!;
  // Initial value when loaded - should be "not found"
  waitTilEqual(()=>{
    let pNotFoundItem = divCurrent.querySelector("p.not-found-item");  
    return pNotFoundItem?.textContent;
  }, "NOT_FOUND: 1", "Before we add anything - the component should say NOT_FOUND: 1");
  // Add items:
  await db.items.put({
    id: 1,
    name: "Foo",
  });
  await waitTilEqual(
    ()=>divCurrent.querySelector("div#item-1")?.textContent,
    "ID: 1Name: Foo",
    "Current item should have been rendered");

  // Update it:
  await db.items.update(1, {name: "Bar"});
  await waitTilEqual(
    ()=>divCurrent.querySelector("div#item-1")?.textContent,
    "ID: 1Name: Bar",
    "Current item should have been updated");

  // Remove it:
  db.items.delete(1);
  await waitTilOk(()=>{
    const current = divCurrent.querySelector("div#item-1");
    const pNotFoundItem = divCurrent.querySelector("p.not-found-item");
    return !current
  }, "Item 1 should not be in the DOM tree anymore");
  assert.equal(divCurrent.querySelector("p.not-found-item")?.textContent, "NOT_FOUND: 1", "After deleting it - the component should say NOT_FOUND: 1");
});

test("Clicking next button will update the currently viewed item", async ()=>{
  const divCurrent = div.querySelector("div#current")!;
  // Add items:
  await db.items.bulkPut([{
    id: 1,
    name: "Hello",
  }, {
    id: 2,
    name: "World"
  }]);

  await waitTilEqual(()=>divCurrent.textContent, "Current itemID: 1Name: Hello", "We are now vieweing item 1");

  // Click next button and verify we are then viewing item 2
  const btnNext = div.querySelector("#btnNext");
  // Click button:
  (btnNext as HTMLElement).click();
  await waitTilEqual(()=>divCurrent.textContent, "Current itemID: 2Name: World", "We are now vieweing item 2");
});

test("Selecting invalid key trigger the err-boundrary", async ()=>{
  // Stop test from failing because we trigger an error!
  QUnit["onUnhandledRejection"] = ()=>true;
  QUnit["onUncaughtException"] = ()=>true; // Needed in latest version of qunit when "global failure: " is preventing test from succeeding.
  QUnit["onError"] = ()=>true;
  //QUnit.config.current.ignoreGlobalErrors = true;
  /*
  self.onunhandledrejection = (ev)=>{
    ev.preventDefault();
    ev.stopPropagation();
    return false;
  };*/
  //console.error = ()=>{};
  
  

  // Add some data:
  await db.items.bulkPut([{
    id: 1,
    name: "Hello",
  }, {
    id: 2,
    name: "World"
  }]);

  // Wait for both parts to update...
  await waitTilOk(()=>{
    const list = div.querySelector("ul#itemList")?.textContent;
    return list === "ID: 1Name: HelloID: 2Name: World";
  }, "We have a inital setup with two items in the list: 'Hello' and 'World'");

  // Now click the invalid key and wait for a render:
  // Click a bad button:
  (div.querySelector("#btnInvalidKey") as HTMLElement).click();
  await waitTilOk(()=>/Something went wrong/.test(div.innerText), "The error boundrary should be shown");
  
  // Restore the gui from the error state:
  (div.querySelector("#btnFirst") as HTMLElement).click();
  (div.querySelector("#btnRetry") as HTMLElement).click();
});
