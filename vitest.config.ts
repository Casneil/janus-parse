import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "node-tests",
          include: [
            "tests/server/**/*.test.{ts,js}",
            "tests/utils/**/*.test.{ts,js}",
          ],
          environment: "node",
        },
      },
      {
        test: {
          name: "dom-tests",
          include: ["tests/client/**/*.test.{ts,js}"],
          environment: "happy-dom",
        },
      },
    ],
  },
});
