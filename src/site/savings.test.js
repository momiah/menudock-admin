import { gbp, savings } from "./savings";

test("compares app commission with MenuDock's 5% + monthly fee", () => {
  expect(savings({ monthlySales: 8000, commissionPercent: 30 })).toEqual({ marketplace: 2400, menudock: 529, perMonth: 1871, perYear: 22452 });
  expect(savings({ monthlySales: 8000, commissionPercent: 30, delivery: true }).menudock).toBe(549);
});

test("copes with nonsense input and shows a negative difference honestly", () => {
  expect(savings({ monthlySales: "abc", commissionPercent: 30 }).marketplace).toBe(0);
  expect(savings({ monthlySales: 500, commissionPercent: 10 }).perMonth).toBeLessThan(0);
  expect(gbp(1871)).toBe("£1,871");
  expect(gbp(-100)).toBe("−£100");
});
