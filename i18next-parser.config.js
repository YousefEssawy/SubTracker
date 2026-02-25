export default {
  defaultNamespace: "translation",
  lexers: {
    js: ["JsxLexer"],
    jsx: ["JsxLexer"],
    default: ["JsxLexer"],
  },
  locales: ["en", "ar"],
  output: "src/locales/$LOCALE/$NAMESPACE.json",
  input: ["src/**/*.{js,jsx}"],
  keepRemoved: true,
};
