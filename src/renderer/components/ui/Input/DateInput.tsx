import { useCallback, type ChangeEvent } from 'react'
import { Input, type InputProps } from './Input'

export interface DateInputProps extends Omit<InputProps, 'onChange' | 'value' | 'maxLength'> {
  value: string
  onChange: (value: string) => void
}

/**
 * DateInput component with auto-formatting for DD/MM/YYYY format
 * Automatically adds slashes as user types and only allows numeric input
 */
export function DateInput({
  value,
  onChange,
  placeholder = "JJ/MM/AAAA",
  ...props
}: DateInputProps) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      const cursorPosition = e.target.selectionStart || 0
      const prevValue = value

      // If user is deleting (input shorter than previous), handle backspace on slashes
      if (input.length < prevValue.length) {
        // Remove the digit before the slash if cursor is right after a slash
        if (prevValue[cursorPosition] === '/') {
          const newVal = prevValue.slice(0, cursorPosition - 1) + prevValue.slice(cursorPosition)
          onChange(newVal)
          return
        }
        onChange(input)
        return
      }

      // Remove all non-digits for processing
      const digits = input.replace(/\D/g, "")

      // Limit to 8 digits (DDMMYYYY)
      const limitedDigits = digits.slice(0, 8)

      // Format as DD/MM/YYYY
      let formatted = ""
      if (limitedDigits.length > 0) {
        formatted = limitedDigits.slice(0, 2)
      }
      if (limitedDigits.length > 2) {
        formatted += "/" + limitedDigits.slice(2, 4)
      }
      if (limitedDigits.length > 4) {
        formatted += "/" + limitedDigits.slice(4, 8)
      }

      onChange(formatted)
    },
    [value, onChange]
  )

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      maxLength={10}
      inputMode="numeric"
      {...props}
    />
  )
}
