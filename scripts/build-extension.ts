/**
 * Build Script cho Extension
 * Đảm bảo extension được build đúng cách với tất cả dependencies
 */

import { build } from 'vite';
import { resolve } from 'path';
import fs from 'fs-extra';

async function buildExtension() {
  console.log('🚀 Starting extension build process...');

  try {
    // Clean dist directory
    console.log('🧹 Cleaning dist directory...');
    await fs.remove('dist');

    // Build with Vite
    console.log('📦 Building with Vite...');
    await build();

    // Copy icons to correct location
    console.log('📄 Copying icons...');
    await fs.ensureDir('dist/icons');
    await fs.copy('public/icons', 'dist/icons');

    // Validate manifest
    console.log('✅ Validating manifest...');
    const manifest = await fs.readJson('dist/manifest.json');
    
    // Check required files exist
    const requiredFiles = [
      'assets/service-worker.js',
      'assets/content-script.js',
      'src/popup/popup.html',
      'icons/icon-16.png',
      'icons/icon-48.png',
      'icons/icon-128.png'
    ];

    for (const file of requiredFiles) {
      const exists = await fs.pathExists(resolve('dist', file));
      if (!exists) {
        throw new Error(`Required file missing: ${file}`);
      }
    }

    console.log('✅ Extension build completed successfully!');
    console.log('📁 Build output: dist/');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildExtension();
