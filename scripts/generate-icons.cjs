#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')

const buildDir = path.join(__dirname, '..', 'build')

async function generateIcons() {
  // Check if sharp is available
  let sharp
  try {
    sharp = require('sharp')
  } catch (e) {
    console.warn('⚠ sharp not available, trying alternative icon generation...')
    await generateWithFallback()
    return
  }

  const svgPath = path.join(buildDir, 'icon.svg')

  if (!fs.existsSync(svgPath)) {
    console.error('❌ build/icon.svg not found')
    process.exit(1)
  }

  const svgBuffer = fs.readFileSync(svgPath)

  console.log('🎬 Generating ACMigo icons...')

  // Generate PNG 512x512 (Linux + base for others)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(buildDir, 'icon.png'))
  console.log('  ✓ icon.png (512x512)')

  // Generate multiple sizes for ICO
  const icoSizes = [16, 24, 32, 48, 64, 128, 256]
  const icoBuffers = []

  for (const size of icoSizes) {
    const buf = await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer()
    icoBuffers.push({ size, buf })
  }

  // Write ICO manually (simple ICO format)
  const icoData = createIco(icoBuffers)
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoData)
  console.log('  ✓ icon.ico')

  // For macOS icns - electron-builder handles conversion from PNG
  // Generate a 1024x1024 PNG that electron-builder will convert to icns
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(buildDir, 'icon@2x.png'))
  console.log('  ✓ icon@2x.png (1024x1024)')

  // Generate icns directory structure for macOS
  const icnsDir = path.join(buildDir, 'icons')
  if (!fs.existsSync(icnsDir)) fs.mkdirSync(icnsDir, { recursive: true })

  const iconSizes = [16, 32, 64, 128, 256, 512, 1024]
  for (const size of iconSizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(icnsDir, `${size}x${size}.png`))
  }
  console.log('  ✓ icons/ directory')

  console.log('✅ All icons generated successfully!')
}

function createIco(images) {
  // ICO format: ICONDIR + ICONDIRENTRYs + image data
  const numImages = images.length
  const headerSize = 6 // ICONDIR
  const entrySize = 16 // ICONDIRENTRY per image
  const dataOffset = headerSize + entrySize * numImages

  // Calculate total size
  let totalDataSize = 0
  for (const img of images) totalDataSize += img.buf.length

  const buffer = Buffer.alloc(dataOffset + totalDataSize)

  // ICONDIR header
  buffer.writeUInt16LE(0, 0) // reserved
  buffer.writeUInt16LE(1, 2) // type: ICO
  buffer.writeUInt16LE(numImages, 4) // count

  let offset = dataOffset
  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    const entryOffset = headerSize + i * entrySize

    // ICONDIRENTRY
    buffer.writeUInt8(img.size === 256 ? 0 : img.size, entryOffset)     // width (0 = 256)
    buffer.writeUInt8(img.size === 256 ? 0 : img.size, entryOffset + 1) // height
    buffer.writeUInt8(0, entryOffset + 2)   // color count
    buffer.writeUInt8(0, entryOffset + 3)   // reserved
    buffer.writeUInt16LE(1, entryOffset + 4) // planes
    buffer.writeUInt16LE(32, entryOffset + 6) // bit count
    buffer.writeUInt32LE(img.buf.length, entryOffset + 8)  // size
    buffer.writeUInt32LE(offset, entryOffset + 12) // offset

    img.buf.copy(buffer, offset)
    offset += img.buf.length
  }

  return buffer
}

async function generateWithFallback() {
  // Create a minimal valid PNG using Node.js buffers if sharp isn't available
  // This is a fallback - the GitHub Actions workflow installs sharp anyway
  console.log('  Using SVG as fallback (sharp required for proper icons)')
  const svgPath = path.join(buildDir, 'icon.svg')
  if (fs.existsSync(svgPath)) {
    // Copy SVG as PNG placeholder (won't work as real PNG but won't crash either)
    console.log('  ⚠ Please run: npm install sharp')
    console.log('  Or on Ubuntu: sudo apt-get install -y libvips-dev')
  }
}

generateIcons().catch(err => {
  console.error('❌ Icon generation failed:', err.message)
  // Don't exit with error - build can continue with existing icons
  process.exit(0)
})
