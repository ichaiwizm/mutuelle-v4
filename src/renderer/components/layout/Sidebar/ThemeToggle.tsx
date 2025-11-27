import { Moon, Sun } from 'lucide-react'
import { Button } from '../../ui/Button'
import { useTheme } from '../ThemeProvider'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-full justify-start">
      {resolvedTheme === 'dark' ? (
        <>
          <Sun className="h-4 w-4" />
          <span>Light mode</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span>Dark mode</span>
        </>
      )}
    </Button>
  )
}
