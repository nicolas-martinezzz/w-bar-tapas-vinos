import nextPlugin from "@next/eslint-plugin-next";

export default [
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
];
