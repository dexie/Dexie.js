import {test, module, stop, start, asyncTest, equal, ok} from 'QUnit';
import {RangeSet, mergeRanges, rangesOverlap} from "../src/helpers/rangeset";

module("rangeset");

test("it should do match correctly", () => {
  const set = new RangeSet()
    .add({from: 1, to: 1})
    .add({from: 2, to: 10})
    .add({from: 20, to: 30})
    .add({from: 40, to: 40});

  ok(!rangesOverlap(set, new RangeSet(1.1, 1.9)), "set does not overlap with 1.1-1.9");
  ok(rangesOverlap(set, new RangeSet(1, 1)), "set overlaps with 1-1");
  ok(rangesOverlap(set, new RangeSet(0, 1)), "set overlaps with 0-1");
  ok(!rangesOverlap(set, new RangeSet(0, 0.9)), "set doesnt overlap with 0-0.9");
  ok(rangesOverlap(set, new RangeSet(39, 41)), "set overlaps with 39-40");
});

test("it should balance itself", () => {
  const set = new RangeSet();
  for (let i = 0; i < 10000; ++i) {
    set.add({from: i, to: i + 0.5});
  }
  ok(!isNaN(set.d) && set.d <= 14 && set.d >= 1, "Depth should be below or equal to 14");
  set.add({from: 0, to: 10000});
  equal(set.d, 1, "After adding a super range, the depth should be 1");
  equal([...set].length, 1, "After adding the super range, the entire set should just contain the super set");
});

test("it should be iterable", () => {
  const set = new RangeSet();
  for (let i = 0; i < 10; ++i) {
    set.addKey(i);
  }
  equal([...set].length, 10, "Should iterate 10 items");
  ok([...set].every((node, i) => node.from === i && node.to === i), "Each node should have correct ranges");
});

test("it should be mergable", () => {
  const set = RangeSet().addKeys([0, 2, 4, 7, 8]);
  const set2 = RangeSet().addKeys([1, 3, 5, 7, 9, 11]);
  set.add(set2);
  equal([...set].map(({ from }) => from).join(','), [
    0,
    1,
    2,
    3,
    4,
    5,
    7,
    8,
    9,
    11,
  ].join(','), "successful merge of two sets");

  set.add(new RangeSet(1, 6));
  equal(JSON.stringify([...set].map(({ from, to }) => [from, to])), JSON.stringify([
    [0, 0],
    [1, 6],
    [7, 7],
    [8, 8],
    [9, 9],
    [11, 11],
  ]), "after adding a super range to some of the containing ranges, the rangeset should have replaced the subranges with their subset");

  set.add({from: 0, to: 20});
  equal(
    JSON.stringify([...set].map(({ from, to }) => [from, to])),
    JSON.stringify([[0, 20]]),
    "after adding a superset, the entire set should just equal the super set");
});

function isSequencial(set) {
  let lastFrom = -Infinity;
  for (const node of [...set]) {
    if (node.from <= lastFrom) {
      return false;
    }
    lastFrom = node.from;
  }
  return true;
}

test("stress", () => {
  const set = new RangeSet();
  //console.log("depth", set.d);
  for (let i=1; i<=600; ++i) {
    set.addKey(i);
  }
  ok(isSequencial(set), "set is sequencial");
  //console.log("the set 1", [...set]);
  //console.log("depth", set.d);
  equal([...set].length, 600, "Set should contain individual ranges");
  ok(isSequencial(set), "set is sequencial");
  //debugger;
  set.add({from: 280, to: 321});
  //console.log("the set 2", JSON.parse(JSON.stringify([...set])));
  ok(isSequencial(set), "set is sequencial");
  //console.log("depth", set.d);
  equal([...set].length, 559, "Set should have less ranges");
  //console.log("depth", set.d);
});

function printTree(nodes, pad=-1) {
  /*function branchLength(node, lr, num=0) {
    return node[lr] ? branchLength(node[lr], lr, num + 1) : num;
  }
  const treeWidth = 1 + branchLength(set, "l") + branchLength(set, "r");*/
  if (pad === -1) pad = 4 * Math.pow(2, nodes[0].d);
  const toPad = pad - ((nodes.length - 1) * 4);
  console.log(nodes.map(node => (node
    ? `[${node.from}-${node.to}]`
    : node === ""
    ? ""
    : " (null) "
  ).padStart(8, " ") ).join('').padStart(toPad, " "));
  const children = nodes.map (node => node ? [node.l, node.r] : ["",""]).flat();
  if (children.some(child => child)) {
    printTree(children, pad);
  }
}

const issue1268_triggering_input = [
  { from: 63, to: 71 },  // 0. Tree: [63-71]
  { from: 99, to: 102 }, // 1. Tree: [63-71]
                         //      (null)  [99-102]
  { from: 90, to: 92 },  // 2. Tree: [99-102]
                         //       [63-71]  (null)
                         //    [90-92] [90-92]
                         // WOW: Here both left and right leafs are the same node!
  { from: 92, to: 95 },  // 3
  { from: 4, to: 10 },   // 4
  { from: 51, to: 51 },  // 5
  { from: 45, to: 46 },  // 6
  { from: 14, to: 20 },  // 7
  { from: 13, to: 20 },  // 8
  { from: 9, to: 12 },   // 9
  { from: 23, to: 25 },  // 10
  { from: 31, to: 35 },  // 11!! After adding this range, circularity is shaped!
  { from: 80, to: 88 },
  { from: 87, to: 91 },
  { from: 36, to: 37 },
  { from: 77, to: 79 }
];

test("issue1268", () => {
  const set = new RangeSet();
  issue1268_triggering_input.forEach((range, idx) => {
    try {
      //if (idx === 11) debugger;
      //console.log(`Adding [${range.from}-${range.to}]`);
      set.add(range);
      if (!verifySet(set)) {
        ok(false, "set not ok at idx " + idx + " depth: " + set.d);
      } else {
        //console.log("Printing tree on idx " + idx);
        //if (idx === 2) debugger;
        //printTree([set]);
      }
    } catch (e) {
      console.log("crashed on idx", idx);
      ok(false, "died on idx " + idx + " with " + e);
    }
  });
  ok(true, "Done");
});

function verifySet(set) {
  let i = issue1268_triggering_input.length + 2;
  for (const node of set) {
    if (--i === 0) return false;
  }
  return true;
}
