import StyleDictionary from "style-dictionary";

const sd = new StyleDictionary("config.json");

StyleDictionary.registerFormat({
  name: "custom/javascript/es6",
  format: ({ dictionary }) => {
    return dictionary.allTokens
      .map((token) => {
        const name = token.name.replace(/^primitives/, "");
        const value =
          typeof token.value === "object" && token.value.hasOwnProperty("value")
            ? token.value.value
            : token.value;
        return `export const ${name} = ${JSON.stringify(value)};`;
      })
      .join("\n");
  },
});

await sd.buildAllPlatforms();
