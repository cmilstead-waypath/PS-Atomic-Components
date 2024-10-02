import {Config} from '@stencil/core';
import html from 'rollup-plugin-html';
export const config: Config = {
  namespace: 'toggle-button',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
      dir: './',
    },
    {
      type: 'docs-json',
      file: 'docs/stencil-docs.json',
    },
  ],
  rollupPlugins: {
    before: [
      html({
        include: './**/*.html',
      }),
    ],
  },
};
