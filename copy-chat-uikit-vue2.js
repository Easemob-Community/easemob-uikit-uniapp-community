/**
 * 将 ChatUIKit-vue2 复制到 vue2-demo 目录
 */
const fs = require('fs')
const path = require('path')

const sourceDir = path.join(__dirname, 'ChatUIKit-vue2')
const targetDir = path.join(__dirname, 'vue2-demo/ChatUIKit')

// 递归复制目录
function copyDir(src, dest) {
  // 创建目标目录
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  // 读取源目录
  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// 删除旧目录
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true })
  console.log('Removed old ChatUIKit directory')
}

// 执行复制
copyDir(sourceDir, targetDir)
console.log(`Copied ${sourceDir} to ${targetDir}`)
console.log('Done!')
