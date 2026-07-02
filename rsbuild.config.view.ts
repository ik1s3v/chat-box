import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { rsBuildHotReloadPlugin } from '@widy/sdk';
import path from 'path';

const entryFilePath = path.join(__dirname, 'src/view/index.tsx');

export default defineConfig({
  plugins: [pluginReact(), rsBuildHotReloadPlugin({ entryFilePath })],
  html: {
    title: 'Widget',
  },
  source: {
    entry: {
      index: './src/view/index.tsx',
    },
  },
  output: {
    cleanDistPath: false,
    filenameHash: false,
    distPath: {
      root: 'dist/view',
      js: '',
      css: '',
    },
    assetPrefix: './',
    copy: [{ from: 'manifest.json', to: '../manifest.json' }],
  },
  performance: {
    chunkSplit: {
      strategy: 'all-in-one',
    },
  },
});
