export const buildClassSelector = (className: string): string =>
  className
    .split(' ')
    .filter(Boolean)
    .map((c) => `.${c}`)
    .join('');

