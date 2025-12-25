import 'dotenv/config'
import { spawn } from 'child_process'

spawn('electron-vite', ['dev', '--', '--no-sandbox'], { stdio: 'inherit', shell: true })
