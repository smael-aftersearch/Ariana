const injectedStyles = new Set<string>();

export function injectStyle(selector: string, style?: string) {
  if (!style) return;

  const key = `${selector}:${hash(style)}`;

  if (injectedStyles.has(key)) {
    return;
  }

  injectedStyles.add(key);

  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-ariana-style', selector);
  styleElement.textContent = style;
  document.head.appendChild(styleElement);
}

function hash(value: string): string {
  let result = 0;

  for (let i = 0; i < value.length; i++) {
    result = (result * 31 + value.charCodeAt(i)) | 0;
  }

  return String(result);
}
