import 'dotenv/config'
import { spawn } from 'child_process'

spawn('electron-vite', ['dev'], { stdio: 'inherit', shell: true })
