import { baseConfig } from "@baseui/config/eslint";

export default [
  ...baseConfig,
  {
    files: ["src/**/*.tsx"],
    rules: {
      // React-specific overrides can go here
    },
  },
];
