import { AlertCircle, Check } from "lucide-react"

interface EditorStatusBarProps {
  isValid: boolean
  lineCount: number
  cursorPosition: { lineNumber: number; column: number } | null
  errorMessage: string | null
}

export function EditorStatusBar({ isValid, lineCount, cursorPosition, errorMessage }: EditorStatusBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-1 text-xs border-t bg-muted">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {isValid ? <Check className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-red-500" />}
          <span>{isValid ? "Valid YAML" : "Invalid YAML"}</span>
        </div>
        {errorMessage && <span className="text-red-500 truncate max-w-[300px]">{errorMessage}</span>}
      </div>
      <div className="flex items-center gap-4">
        <span>Lines: {lineCount}</span>
        {cursorPosition && (
          <span>
            Ln {cursorPosition.lineNumber}, Col {cursorPosition.column}
          </span>
        )}
      </div>
    </div>
  )
}

