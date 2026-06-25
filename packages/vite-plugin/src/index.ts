type VitePlugin = {
  name: string;
  enforce?: 'pre' | 'post';
  transform?: (code: string, id: string) => string | null | Promise<string | null>;
};

export type ArianaVitePluginOptions = {
  include?: RegExp;
};

export function ariana(options: ArianaVitePluginOptions = {}): VitePlugin {
  const include = options.include ?? /\.(ts|tsx)$/;

  return {
    name: 'ariana-framework-template-url',
    enforce: 'pre',
    transform(code: string, id: string) {
      if (!include.test(id) || !code.includes('@Component')) {
        return null;
      }

      return transformComponentResources(code);
    }
  };
}

export default ariana;

function transformComponentResources(code: string): string {
  let importIndex = 0;
  const imports: string[] = [];
  let transformed = code;

  transformed = transformed.replace(
    /templateUrl\s*:\s*(['"])(.*?)\1/g,
    (_, _quote: string, path: string) => {
      const name = `__ari_template_${importIndex++}`;
      imports.push(`import ${name} from ${JSON.stringify(`${path}?raw`)};`);
      return `template: ${name}`;
    }
  );

  transformed = transformed.replace(
    /styleUrl\s*:\s*(['"])(.*?)\1/g,
    (_, _quote: string, path: string) => {
      const name = `__ari_style_${importIndex++}`;
      imports.push(`import ${name} from ${JSON.stringify(`${path}?raw`)};`);
      return `style: ${name}`;
    }
  );

  if (imports.length === 0) {
    return code;
  }

  return `${imports.join('\n')}\n${transformed}`;
}
