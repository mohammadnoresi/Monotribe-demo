import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { spawnSync } from 'node:child_process'

const candidates = [
  process.env.PYTHON,
  'python3',
  `${homedir()}/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3`,
].filter(Boolean)

const python = candidates.find((candidate) => {
  const check = spawnSync(candidate, ['-c', 'from PIL import Image'], {
    encoding: 'utf8',
    stdio: 'ignore',
  })

  return check.status === 0
})

if (!python) {
  console.error('Could not find a Python runtime with Pillow installed.')
  console.error('Install Pillow locally or run this inside the Codex workspace runtime.')
  process.exit(1)
}

const scriptPath = 'scripts/generateAvatarThumbnails.py'

if (!existsSync(scriptPath)) {
  console.error(`Missing thumbnail script: ${scriptPath}`)
  process.exit(1)
}

const result = spawnSync(python, [scriptPath], {
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
