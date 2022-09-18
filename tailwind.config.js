/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".hide-scrollbar": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        },
        ".hide-scrollbar::-webkit-scrollbar": {
          display: "none",
        },
      });
    }),
    plugin(
      function ({ matchUtilities, theme }) {
        matchUtilities(
          {
            mask: (value) => ({
              mask: value,
              "-webkit-mask": value,
            }),
          },
          {
            values: theme("mask"),
          }
        );
        matchUtilities({
          filter: (value) => ({
            filter: value,
            "-webkit-filter": value,
          }),
        });
      },
      {
        theme: {
          mask: {
            "to-b": "linear-gradient(black, transparent)",
            "to-t": "linear-gradient(transparent, black)",
          },
        },
      }
    ),
  ],
};
