#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const root = path.resolve(new URL(import.meta.url).pathname, '..')
const srcDir = path.join(root, '../src')
const backupDir = path.join(root, '../.comment_backups')

const exts = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.json', '.html'])

function walk(dir) {
  const results = []
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      results.push(...walk(full))
    } else if (stat.isFile()) {
      results.push(full)
    }
  }
  return results
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

function relative(from, to) {
  return path.relative(from, to).replace(/\\/g, '/')
}

function processFile(file) {
  const ext = path.extname(file).toLowerCase()
  if (!exts.has(ext)) return false

  const text = fs.readFileSync(file, 'utf8')
  // backup
  const rel = relative(srcDir, file)
  const backupPath = path.join(backupDir, rel)
  ensureDir(path.dirname(backupPath))
  fs.writeFileSync(backupPath, text, 'utf8')

  // remove block comments /* ... */ and full-line // comments
  let out = text.replace(/\/\*[\s\S]*?\*\//g, '')
  out = out.replace(/^\s*\/\/.*$/gm, '')

  // write back
  fs.writeFileSync(file, out, 'utf8')
  return true
}

function main() {
  if (!fs.existsSync(srcDir)) {
    console.error('source directory not found:', srcDir)
    process.exit(1)
  }
  ensureDir(backupDir)
  const files = walk(srcDir)
  let count = 0
  for (const f of files) {
    if (processFile(f)) count++
  }
  console.log(`Processed ${count} files. Backups stored in ${backupDir}`)
}

main()
