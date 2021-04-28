

```js
  { from: 63, to: 71 },  // 0. Tree: [63-71]
  { from: 99, to: 102 }, // 1. Tree: [63-71]
                         //      (null)  [99-102]
  { from: 90, to: 92 },  // 2. Tree: [99-102]
                         //       [63-71]  (null)
                         //    [90-92] [90-92]
                         // WOW: Here both left and right leafs are the same node!
```

```
Tree:
        [63-71]
    (null)  [99-102]

Insert [90-92]:

        [63-71]
  (null)      [99-102]
          [90-92]    (null)

Rotation:
       [99-102]
  [63-72]       (null)
(null)   [90-92]

Rebalance root (as it SHOULD be):

          [90-92]
  [63-71]        [99-102]
(null) (null)  (null)  (null)
```