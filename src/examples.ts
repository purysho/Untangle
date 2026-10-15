export const examples = [
  {
    name: "Ambiguous procedure",
    title: "Access panel inspection",
    text: `1. Disconnect the power supply as required.
2. Remove the access panel and inspect the seal.
3. After step 2, clean it carefully.
4. If the seal is damaged, it should be replaced.
5. Before step 6, install the access panel.
6. After step 5, tighten the fasteners appropriately.`,
  },
  {
    name: "Explicit dependencies",
    title: "Bench test sequence",
    text: `1. Record the equipment identifier.
2. After step 1, disconnect the test supply.
3. After step 2, connect the test lead.
4. After step 3, record the indicator reading.
5. After step 4, disconnect the test lead.`,
  },
  {
    name: "Broken sequence",
    title: "Dependency stress test",
    text: `1. After step 3, open the housing.
2. After step 1, inspect the seal.
3. After step 2, close the housing.
4. After step 9, record the result.`,
  },
];
