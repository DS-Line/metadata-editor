"use client"

import type React from "react"

import { useCallback, useEffect, useRef, useState } from "react"
import type { editor } from "monaco-editor"
import { parse, stringify } from "yaml"

type MonacoEditor = editor.IStandaloneCodeEditor
type Monaco = typeof editor

interface UseMonacoEditorProps {
    initialValue: string
    onChange?: (value: string) => void
}

interface UseMonacoEditorReturn {
    editorRef: React.MutableRefObject<MonacoEditor | null>
    monacoRef: React.MutableRefObject<Monaco | null>
    isReady: boolean
    value: string
    setValue: (value: string) => void
    format: () => void
    validateYaml: (yamlString?: string) => { valid: boolean; parsed?: any; error?: string }
    cursorPosition: { lineNumber: number; column: number } | null
    selection: editor.ISelection | null
    lineCount: number
}

export function useMonacoEditor({ initialValue, onChange }: UseMonacoEditorProps): UseMonacoEditorReturn {
    const editorRef = useRef<MonacoEditor | null>(null)
    const monacoRef = useRef<Monaco | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [value, setValue] = useState(initialValue)
    const [cursorPosition, setCursorPosition] = useState<{ lineNumber: number; column: number } | null>(null)
    const [selection, setSelection] = useState<editor.ISelection | null>(null)
    const [lineCount, setLineCount] = useState(initialValue.split("\n").length)

    // Format YAML document
    const format = useCallback(() => {
        if (!editorRef.current) return

        try {
            const currentValue = editorRef.current.getValue()
            const parsed = parse(currentValue)
            const formatted = stringify(parsed, { indent: 2 })

            // Preserve cursor position
            const position = editorRef.current.getPosition()

            // Set the formatted value
            editorRef.current.setValue(formatted)

            // Restore cursor position
            if (position) {
                editorRef.current.setPosition(position)
                editorRef.current.revealPositionInCenter(position)
            }

            setValue(formatted)
            setLineCount(formatted.split("\n").length)
        } catch (error) {
            console.error("Error formatting YAML:", error)
        }
    }, [])

    // Validate YAML
    const validateYaml = useCallback(
        (yamlString?: string) => {
            const textToValidate = yamlString || (editorRef.current ? editorRef.current.getValue() : value)

            try {
                const parsed = parse(textToValidate)
                return { valid: true, parsed }
            } catch (error) {
                const errorMessage = error?.message || "Invalid YAML"
                return { valid: false, error: errorMessage }
            }
        },
        [value],
    )

    // Update cursor position
    useEffect(() => {
        if (!editorRef.current || !isReady) return

        const disposable = editorRef.current.onDidChangeCursorPosition((e) => {
            setCursorPosition({ lineNumber: e.position.lineNumber, column: e.position.column })
        })

        return () => {
            disposable.dispose()
        }
    }, [isReady])

    // Update selection
    useEffect(() => {
        if (!editorRef.current || !isReady) return

        const disposable = editorRef.current.onDidChangeCursorSelection((e) => {
            setSelection(e.selection)
        })

        return () => {
            disposable.dispose()
        }
    }, [isReady])

    // Update value on change
    useEffect(() => {
        if (!editorRef.current || !isReady) return

        const disposable = editorRef.current.onDidChangeModelContent(() => {
            const newValue = editorRef.current!.getValue()
            setValue(newValue)
            setLineCount(newValue.split("\n").length)

            if (onChange) {
                onChange(newValue)
            }
        })

        return () => {
            disposable.dispose()
        }
    }, [isReady, onChange])

    return {
        editorRef,
        monacoRef,
        isReady,
        value,
        setValue: (newValue: string) => {
            if (editorRef.current) {
                editorRef.current.setValue(newValue)
            }
            setValue(newValue)
            setLineCount(newValue.split("\n").length)
        },
        format,
        validateYaml,
        cursorPosition,
        selection,
        lineCount,
    }
}

