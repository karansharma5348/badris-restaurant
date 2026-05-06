import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const walk = (dir) => {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach(file => {
    file = path.join(dir, file)
    const stat = fs.statSync(file)
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file))
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file)
      }
    }
  })
  return results
}

const files = walk(path.join(__dirname, 'client/src'))
let changedCount = 0

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8')
  let changed = false
  
  // Replace un-prefixed images in src attributes
  // Matches src="/anything.png" or src='/anything.png'
  const imageRegex = /src=["']\/(.*?)\.(png|jpg|jpeg|svg|webp)["']/g
  if (imageRegex.test(content)) {
    content = content.replace(imageRegex, "src={`\${import.meta.env.BASE_URL}$1.$2`}")
    changed = true
  }

  // Replace images in object properties (like in Menu.tsx or Specialties.tsx)
  // Matches image: '/anything.png'
  const propRegex = /image:\s*['"]\/(.*?)\.(png|jpg|jpeg|svg|webp)['"]/g
  if (propRegex.test(content)) {
    content = content.replace(propRegex, "image: `\${import.meta.env.BASE_URL}$1.$2`")
    changed = true
  }

  // Handle placeholders or other string occurrences
  const placeholderRegex = /['"]\/(.*?)\.(png|jpg|jpeg|svg|webp)['"]/g
  // We need to be careful here not to replace things that are already handled or shouldn't be.
  // But for this project, /filename.png is almost always an asset.
  // I'll skip this broad one to avoid breaking things and stick to the specific ones above.

  if (changed) {
    fs.writeFileSync(file, content)
    changedCount++
    console.log(`Updated assets in: ${file}`)
  }
})

console.log(`\nSuccessfully updated assets in ${changedCount} files.`)
