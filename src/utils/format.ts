export const formatList = <T>(
  items: T[],
  format: (item: T) => string,
  empty = "(none yet)",
) => (items.length ? items.map(format).join("\n") : empty);

export const dedent = (strings: TemplateStringsArray, ...values: unknown[]) => {
  const result = strings.reduce(
    (output, string, i) => output + string + (values[i] ?? ""),
    "",
  );

  const lines = result.split("\n");
  const indent = Math.min(
    ...lines
      .filter((line) => line.trim())
      .map((line) => line.match(/^\s*/)?.[0].length ?? 0),
  );

  return lines
    .map((line) => line.slice(indent))
    .join("\n")
    .trim();
};
