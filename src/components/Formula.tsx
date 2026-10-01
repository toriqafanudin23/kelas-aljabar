import { renderToString } from "katex";

interface FormulaProps {
  math: string;
}

export function Formula({ math }: FormulaProps) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: renderToString(math, {
          displayMode: true,
          throwOnError: false,
        }),
      }}
    />
  );
}
