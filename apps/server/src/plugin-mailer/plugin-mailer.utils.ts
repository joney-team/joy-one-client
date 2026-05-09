type RenderArgs = {
  template: string;
  renders: {
    [key: string]: () => string;
  };
};

export function renderTemplate(args: RenderArgs): string {
  const { template, renders } = args;

  return template.replace(/<!--\s*\{(\w+)\}\s*-->/g, (match, key) => {
    const renderFn = renders[key];
    return typeof renderFn === "function" ? renderFn() : match;
  });
}