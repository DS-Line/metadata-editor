// @ts-nocheck

"use client"

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react"
import Image from "next/image"

import Editor, { type OnMount } from "@monaco-editor/react"
import {
  AlertCircle,
  BarChart3,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Code,
  Copy,
  Database,
  Download,
  File,
  FileCode,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
  FolderTree,
  GitBranch,
  Globe,
  Keyboard,
  Layers,
  LineChart,
  Loader2,
  LucideIcon,
  Map,
  Maximize2,
  Minimize2,
  Moon,
  Save,
  Settings,
  SquarePen,
  Sun,
  Trash2,
  TypeIcon as type,
  Users,
  WrapTextIcon as Wrap,
  X,
} from "lucide-react"
import type * as monaco from "monaco-editor"
import { useTheme } from "next-themes"
import { parse, parseDocument, stringify } from "yaml"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog"
import MetadataOptions from "./ui/metadata-options"
import { ResizablePanel, ResizablePanelGroup } from "./ui/resizable"
import { cn } from "./ui/utils"

// Sample YAML data (truncated for brevity)

// Type definitions
interface SectionIcons {
  [key: string]: LucideIcon
}

interface LevelIcons {
  [key: number]: LucideIcon
  default: LucideIcon
}

interface EditorLineMap {
  [key: number]: string
}

interface SectionRange {
  lineNumber: number
  startLine: number
  endLine: number
  startColumn: number
  endColumn: number
}

interface Position {
  lineNumber: number
  column: number
}

interface EditorStats {
  lineCount: number
  currentLine: number
  currentColumn: number
  fileSize: string
  selectionLength: number
}

export interface Metadata {
  id: string
  metadata_name: string
  content: string
  owner_id: string
  metadata_type: string
  version: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Section icons mapping with fixed icons
const SECTION_ICONS: SectionIcons = {
  attributes: GitBranch,
  source: Database,
  metrics: LineChart,
  marketing: BarChart3,
  sales: Globe,
  technologies: Layers,
  strategies: Settings,
  regions: Globe,
  team_lead: Users,
  default: FileText,
  array: Layers,
  object: Folder,
  primitive: File,
}

// Level-based icons for tree hierarchy
const LEVEL_ICONS: LevelIcons = {
  0: FolderTree, // Root level
  // 1: Folder, // First level
  // 2: Database, // Second level
  // 3: FileText, // Third level
  default: File, // Default for any other level
}

export default function YamlEditor({
  isSaving,
  deleteId,
  isDeletedFlag,
  setDeleteId,
  metadataType,
  isLoadingYaml,
  isFetchingList,
  handleGenerate,
  addMetadata,
  handleUploadMetadata,
  metaYamlData,
  getEditorData,
  getidData,
  customLoader,
  currentTab,
  isViewOnly = false,
  className = "",
}: {
  setDeleteId: (value: React.SetStateAction<string>) => void
  isDeletedFlag: boolean
  isSaving: boolean
  deleteId: string
  metadataType: string
  isLoadingYaml?: boolean
  isFetchingList?: boolean
  metaYamlData?: Metadata[]
  handleUploadMetadata: () => void
  handleGenerate: () => void
  addMetadata: () => void
  customLoader: string
  getidData?: (id: string) => void
  currentTab?: string
  isViewOnly?: boolean

  getEditorData?: (getEditorData: string, id: string) => void
  className?: string
}): JSX.Element {
  const [myListOfYamlData, setMyListOfYamlData] = useState<Record<string, any>>(
    {}
  )
  const [yamlData, setYamlData] = useState<string>("")
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof monaco | null>(null)
  const sidebarTreeRef = useRef<HTMLDivElement | null>(null)
  const [parsedYaml, setParsedYaml] = useState<Record<string, any>>({})
  const [parseError, setParseError] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  )
  const idData = useRef<string>("")
  const nameData = useRef<string>("")
  const [themeData, setThemeData] = useState("dark")
  const [activeDecorations, setActiveDecorations] = useState<string[]>([])
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false)
  const [editorLineMap, setEditorLineMap] = useState<EditorLineMap>({})
  const [sidebarSize, setSidebarSize] = useState<number>(25)
  const { theme, setTheme } = useTheme()
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)
  const [showMinimap, setShowMinimap] = useState<boolean>(true)
  const [wordWrap, setWordWrap] = useState<"on" | "off">("on")
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editorStats, setEditorStats] = useState<EditorStats>({
    lineCount: 0,
    currentLine: 1,
    currentColumn: 1,
    fileSize: "0 KB",
    selectionLength: 0,
  })
  const [value, setValue] = useState("")
  const [isEditing, setisEditing] = useState(true)
  const [editId, setEditId] = useState("")
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] =
    useState<boolean>(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)
  const redDotDecoration = useRef<monaco.editor.IEditorDecorationsCollection>()
  // Enhanced YAML validation function
  const validateYaml = useCallback(
    (yamlString: string, edit: boolean) => {
      try {
        const parsed = parse(yamlString) as Record<string, any>
        setParsedYaml(parsed)
        setParseError(null)
        if (redDotDecoration.current) {
          redDotDecoration.current.clear()
        }
        if (parsed) {
          setMyListOfYamlData((prev) => {
            try {
              const currKeys = Object.keys(parsed)
              const reqKey = Object.keys(prev)
                .filter((el) => el !== idData.current)
                .flatMap((el) =>
                  prev[el] !== null ? Object.keys(prev[el]) : []
                )
              if (reqKey.includes(currKeys[0])) {
                throw new Error("Duplicate File Name")
              } else {
                const requiredObj = { ...prev }
                requiredObj[idData.current] =
                  typeof parsed === "string" ? { [parsed]: {} } : parsed
                return requiredObj
              }
            } catch (error) {
              const fileNameErrorMessage =
                error instanceof Error ? error.message : "Invalid YAML"
              if (redDotDecoration.current) {
                redDotDecoration.current.clear()
              }
              if (editorRef.current && monacoRef.current) {
                redDotDecoration.current =
                  editorRef.current.createDecorationsCollection([
                    {
                      range: new monacoRef.current.Range(1, 1, 1, 10),
                      options: {
                        className: "yaml-error-highlight",
                        glyphMarginClassName: "yaml-error-glyph",
                        hoverMessage: { value: fileNameErrorMessage },
                      },
                    },
                  ])
                // setActiveDecorations(decorations)

                // setTimeout(() => {
                //   if (editorRef.current) {
                //     editorRef.current.deltaDecorations(decorations, [])
                //   }
                // }, 1500)
                setParseError(fileNameErrorMessage)
              }
              return prev
            }
            // // Iterate over the `prev` array to update only the matching objects in parsed
            // if (prev.length) {
            //   return prev.map((item) => {
            //     const key = Object.keys(item)[0]
            //     if (currKeys.includes(key)) {
            //       // If the key exists in `currKeys`, update the value
            //       return { [key]: parsed[key] }
            //     }
            //     // If the key doesn't exist in `currKeys`, return the original item
            //     return item
            //   })
            // }
            // if (typeof parsed === "object") return [parsed]
            // return []
          })
        } else {
          setMyListOfYamlData((prev) => {
            if (Object.keys(prev).some((el) => el === idData.current)) {
              return { ...prev, [idData.current]: { "": {} } }
            }
            return prev
          })
        }

        // After successful parsing, build the line map
        buildEditorLineMap(yamlString, parsed)

        // Update file size
        const bytes = new Blob([yamlString]).size
        let fileSize = ""
        if (bytes < 1024) {
          fileSize = `${bytes} B`
        } else if (bytes < 1024 * 1024) {
          fileSize = `${(bytes / 1024).toFixed(1)} KB`
        } else {
          fileSize = `${(bytes / (1024 * 1024)).toFixed(1)} MB`
        }

        setEditorStats((prev) => ({
          ...prev,
          lineCount: yamlString.split("\n").length,
          fileSize,
        }))
        return { valid: true, parsed }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Invalid YAML"
        let formattedError = errorMessage

        const lineMatch = errorMessage.match(/line (\d+)/)
        const colMatch = errorMessage.match(/column (\d+)/)
        if (lineMatch && colMatch) {
          const line = Number.parseInt(lineMatch[1])
          const col = Number.parseInt(colMatch[1])
          formattedError = `Error at line ${line}, column ${col}: ${errorMessage}`
          if (redDotDecoration.current) {
            redDotDecoration.current.clear()
          }
          if (editorRef.current && monacoRef.current) {
            redDotDecoration.current =
              editorRef.current.createDecorationsCollection([
                {
                  range: new monacoRef.current.Range(line, col, line, col + 1),
                  options: {
                    className: "yaml-error-highlight",
                    glyphMarginClassName: "yaml-error-glyph",
                    hoverMessage: { value: errorMessage },
                  },
                },
              ])

            // setActiveDecorations(decorations)

            // setTimeout(()=>{
            //   if (editorRef.current) {
            //     editorRef.current.deltaDecorations(decorations, [])
            //   }
            // },100)
          }
        }
        setParseError(formattedError)
        return { valid: false, error: formattedError }
      }
    },
    [myListOfYamlData]
  )

  useEffect(() => {
    if (idData.current && !Number.isNaN(Number(idData.current))) {
      const foundItem: Metadata = metaYamlData.find(
        (item) => item.id === idData.current
      )
      if (!foundItem && editorRef && editorRef.current) {
        const itemNameMeta: Metadata = metaYamlData.find(
          (item) =>
            item.metadata_name ===
            editorRef.current
              .getValue()
              .substring(0, editorRef.current.getValue().indexOf(":"))
              .toString()
              .trim()
        )

        if (itemNameMeta) {
          idData.current = itemNameMeta.id
          nameData.current = itemNameMeta.metadata_name
        }
      }
    }
  }, [metaYamlData])
  useEffect(() => {
    if (isDeletedFlag) {
      editorRef && editorRef.current && editorRef.current.setValue("")
      idData.current = ""
      nameData.current = ""
      setDeleteId("-1")
    }
  }, [isDeletedFlag])
  useEffect(() => {
    if (metaYamlData && metaYamlData.length) {
      const yamlFolders = metaYamlData.map((data) => {
        const safeContent = (data?.content || "")
          .replace(/^---\s*/gm, "") // remove doc start
          .replace(/^\.\.\.\s*/gm, "") // remove doc end

        return `${data?.metadata_name}:\n  ${safeContent.replaceAll(
          "\n",
          "\n  "
        )}`
      })

      const parsed = yamlFolders.map((el) => {
        try {
          return parse(el)
        } catch (err) {
          console.error("YAML parse error", err)
          return {}
        }
      })

      const requiredObject: Record<string, any> = {}
      parsed.forEach((el, index) => {
        requiredObject[metaYamlData[index].id] = el
      })

      setMyListOfYamlData(requiredObject)
    } else {
      setMyListOfYamlData({})
      setYamlData("")
      setSelectedSection(null)
    }
  }, [metaYamlData])

  // Add effect to handle initial file selection
  useEffect(() => {
    if (metaYamlData && metaYamlData.length > 0 && idData.current) {
      const selectedFile = metaYamlData.find(
        (file) => file.id === idData.current
      )
      if (selectedFile) {
        setSelectedSection(selectedFile.metadata_name)
        // Ensure the editor is focused and the content is visible
      }
    }
  }, [metaYamlData, idData.current])

  useEffect(() => {
    if (isEditorReady) {
      navigateToSection(selectedSection)
    }
  }, [isEditorReady])
  // useEffect(() => {
  //   validateYaml(yamlData)
  //   metaYamlData &&
  //     metaYamlData.length &&
  //     editorRef &&
  //     editorRef.current &&
  //     editorRef.current.setValue(
  //       metaYamlData.map(
  //         (data) =>
  //           `${data?.metadata_name}:\n  ${
  //             data?.content?.replaceAll("\n", "\n  ") || ""
  //           }`
  //       )[0]
  //     )
  // }, [yamlData])

  // Build a map of line numbers to YAML paths
  const buildEditorLineMap = useCallback(
    (yamlString: string, parsedYaml: Record<string, any>) => {
      const lines = yamlString.split("\n")
      const lineMap: EditorLineMap = {}

      const buildMap = (
        obj: Record<string, any>,
        path = "",
        lineStart = 0
      ): number => {
        if (!obj || typeof obj !== "object") return lineStart

        let currentLine = lineStart

        while (
          currentLine < lines.length &&
          (lines[currentLine].trim() === "" ||
            lines[currentLine].trim().startsWith("#"))
        ) {
          currentLine++
        }

        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key

          let keyLine = -1
          for (let i = currentLine; i < lines.length; i++) {
            const line = lines[i].trim()
            if (line === "" || line.startsWith("#")) continue

            if (line.startsWith(`${key}:`)) {
              keyLine = i
              break
            }
          }

          if (keyLine !== -1) {
            lineMap[keyLine + 1] = currentPath

            if (typeof value === "object" && value !== null) {
              if (Array.isArray(value)) {
                let arrayLine = keyLine + 1
                for (let i = 0; i < value.length; i++) {
                  while (arrayLine < lines.length) {
                    const line = lines[arrayLine].trim()
                    if (line === "" || line.startsWith("#")) {
                      arrayLine++
                      continue
                    }

                    if (line.startsWith("-")) {
                      lineMap[arrayLine + 1] = `${currentPath}[${i}]`

                      if (typeof value[i] === "object" && value[i] !== null) {
                        arrayLine = buildMap(
                          value[i],
                          `${currentPath}[${i}]`,
                          arrayLine + 1
                        )
                      } else {
                        arrayLine++
                      }
                      break
                    }

                    arrayLine++
                  }
                }
              } else {
                buildMap(value, currentPath, keyLine + 1)
              }
            }
          }
        }

        return currentLine
      }

      buildMap(parsedYaml)
      setEditorLineMap(lineMap)
    },
    []
  )

  // Format YAML document
  const formatYamlDocument = useCallback(() => {
    if (!editorRef.current) return

    try {
      const currentValue = editorRef.current.getValue()
      const parsed = parseDocument(currentValue)
      const formatted = stringify(parsed)

      const position = editorRef.current.getPosition()
      editorRef.current.setValue(formatted)

      if (position) {
        editorRef.current.setPosition(position)
        editorRef.current.revealPositionInCenter(position)
      }

      validateYaml(formatted)
    } catch (error) {
      setParseError(
        `Error formatting YAML: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }, [validateYaml])

  // Copy YAML to clipboard
  const copyToClipboard = useCallback(() => {
    if (!editorRef.current) return

    const content = editorRef.current.getValue()
    navigator.clipboard
      .writeText(content)
      .then(() => {
        const tempAlert = document.createElement("div")
        tempAlert.className =
          "fixed top-4 right-4 bg-primary text-white px-4 py-2 rounded z-50"
        tempAlert.textContent = "YAML copied to clipboard!"
        document.body.appendChild(tempAlert)

        setTimeout(() => {
          document.body.removeChild(tempAlert)
        }, 2000)
      })
      .catch((err) => {
        setParseError("Failed to copy to clipboard")
      })
  }, [])

  // Copy YAML to clipboard
  const editorData = () => {
    if (!editorRef.current) return
    getEditorData(editorRef.current.getValue(), idData.current)
    if (!metaYamlData.some((el) => el.metadata_name === nameData.current)) {
      idData.current = ""
      nameData.current = ""
      editorRef.current = null
    }
  }

  // Download YAML file
  const downloadYaml = useCallback(() => {
    if (!editorRef.current) return

    const content = editorRef.current.getValue()
    const blob = new Blob([content], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "document.yaml"
    document.body.appendChild(a)
    a.click()

    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 0)
  }, [])

  // Export to JSON
  const exportToJson = useCallback(() => {
    if (!editorRef.current) return

    try {
      const content = editorRef.current.getValue()
      const parsed = parse(content)
      const jsonContent = JSON.stringify(parsed, null, 2)

      const blob = new Blob([jsonContent], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = "document.json"
      document.body.appendChild(a)
      a.click()

      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 0)
    } catch (error) {
      setParseError(
        `Error exporting to JSON: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }, [])

  // Toggle full screen mode
  const toggleFullScreen = useCallback(() => {
    // if (!idData.current) return
    setIsFullScreen((prev) => !prev)

    // Add a small delay to allow the UI to update before focusing the editor
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus()
      }
    }, 100)
  }, [])

  // Toggle minimap
  const toggleMinimap = useCallback(() => {
    setShowMinimap((prev) => !prev)
    if (editorRef.current) {
      editorRef.current.updateOptions({
        minimap: { enabled: !showMinimap },
      })
    }
  }, [showMinimap])

  // Toggle word wrap
  const toggleWordWrap = useCallback(() => {
    const newWordWrap = wordWrap === "on" ? "off" : "on"
    setWordWrap(newWordWrap)
    if (editorRef.current) {
      editorRef.current.updateOptions({
        wordWrap: newWordWrap,
      })
    }
  }, [wordWrap])

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])
  const toggleThemeData = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])
  // Toggle section expansion in the tree view
  const toggleSectionExpansion = useCallback(
    (section: string, expand: boolean) => {
      setExpandedSections((prev) => {
        const newSet = new Set([...prev])
        if (!expand) {
          newSet.delete(section)
        } else {
          newSet.add(section)
        }
        return newSet
      })
    },
    [expandedSections]
  )
  // Find the line number and range for a specific section in the YAML
  const findSectionRange = useCallback(
    (section: string, item?: string): SectionRange | null => {
      if (!editorRef.current) return null

      const model = editorRef.current.getModel()
      if (!model) return null

      const text = model.getValue()
      const lines = text.split("\n")

      const arrayMatch = section && section.match(/(.+)\[(\d+)\]$/)
      if (arrayMatch) {
        const arraySection = arrayMatch[1]
        const arrayIndex = Number.parseInt(arrayMatch[2])

        const fullPath = arraySection.split(".")
        let currentLevel = 0
        let currentIndent = -1
        let inTargetSection = false
        let itemCount = 0

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()
          if (line === "" || line.startsWith("#")) continue

          const indent = lines[i].search(/\S/)

          if (indent <= currentIndent && currentLevel > 0) {
            const keyAtIndent = line.split(":")[0].trim()
            if (keyAtIndent !== fullPath[currentLevel]) {
              if (indent <= currentIndent) {
                currentLevel = Math.max(0, currentLevel - 1)
                inTargetSection = false
                if (indent < currentIndent) {
                  currentIndent = indent
                }
              }
            }
          }

          if (line.startsWith(fullPath[currentLevel] + ":")) {
            currentIndent = indent
            currentLevel++

            if (currentLevel === fullPath.length) {
              inTargetSection = true
              itemCount = 0
              continue
            }
          }

          if (inTargetSection && line.startsWith("-")) {
            if (itemCount === arrayIndex) {
              return {
                lineNumber: i + 1,
                startLine: i + 1,
                endLine: i + 1,
                startColumn: 1,
                endColumn: lines[i].length + 1,
              }
            }
            itemCount++
          }
        }

        return null
      }

      if (item) {
        const fullPath = section + "." + item
        const pathSegments = fullPath.split(".")

        let currentLevel = 0
        let currentIndent = -1

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()
          if (line === "" || line.startsWith("#")) continue

          const indent = lines[i].search(/\S/)

          if (indent <= currentIndent && currentLevel > 0) {
            const keyAtIndent = line.split(":")[0].trim()
            if (keyAtIndent !== pathSegments[currentLevel]) {
              if (indent <= currentIndent) {
                currentLevel = Math.max(0, currentLevel - 1)
                if (indent < currentIndent) {
                  currentIndent = indent
                }
              }
            }
          }

          if (line.startsWith(pathSegments[currentLevel] + ":")) {
            currentIndent = indent
            currentLevel++

            if (currentLevel === pathSegments.length) {
              return {
                lineNumber: i + 1,
                startLine: i + 1,
                endLine: i + 1,
                startColumn: 1,
                endColumn: lines[i].length + 1,
              }
            }
          }
        }

        return null
      }

      const pathSegments = section ? section.split(".") : []
      let currentLevel = 0
      let currentIndent = -1

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line === "" || line.startsWith("#")) continue

        const indent = lines[i].search(/\S/)

        if (indent <= currentIndent && currentLevel > 0) {
          const keyAtIndent = line.split(":")[0].trim()
          if (keyAtIndent !== pathSegments[currentLevel]) {
            if (indent <= currentIndent) {
              currentLevel = Math.max(0, currentLevel - 1)
              if (indent < currentIndent) {
                currentIndent = indent
              }
            }
          }
        }

        if (
          pathSegments.length > 0 &&
          line.startsWith(pathSegments[currentLevel] + ":")
        ) {
          currentIndent = indent
          currentLevel++

          if (currentLevel === pathSegments.length) {
            let endLine = i
            const sectionIndent = indent

            for (let j = i + 1; j < lines.length; j++) {
              const nextLine = lines[j].trim()
              if (nextLine !== "" && !nextLine.startsWith("#")) {
                const nextIndent = lines[j].search(/\S/)
                if (nextIndent <= sectionIndent) {
                  endLine = j - 1
                  break
                }
              }
              if (j === lines.length - 1) {
                endLine = j
              }
            }

            return {
              lineNumber: i + 1,
              startLine: i + 1,
              endLine: endLine + 1,
              startColumn: 1,
              endColumn: lines[endLine].length + 1,
            }
          }
        }
      }

      return null
    },
    []
  )

  // Find the exact path for a cursor position
  const findPathForPosition = useCallback(
    (position: Position | null): string | null => {
      if (!editorRef.current || !position) return null

      if (editorLineMap[position.lineNumber]) {
        return editorLineMap[position.lineNumber]
      }

      const lineNumbers = Object.keys(editorLineMap)
        .map(Number)
        .sort((a, b) => a - b)
      let closestLine = -1
      for (const line of lineNumbers) {
        if (line <= position.lineNumber && line > closestLine) {
          closestLine = line
        }
      }

      if (closestLine !== -1) {
        return editorLineMap[closestLine]
      }

      const model = editorRef.current.getModel()
      if (!model) return null

      const lineContent = model.getLineContent(position.lineNumber)
      if (!lineContent) return null

      const keyMatch = lineContent.match(/^\s*([^:]+):/)
      if (!keyMatch) {
        const arrayItemMatch = lineContent.match(/^\s*-\s*(.*)/)
        if (arrayItemMatch) {
          const arrayItemValue = arrayItemMatch[1].trim()

          const findArrayItemPath = (
            obj: Record<string, any>,
            targetValue: string,
            currentPath = ""
          ): string | null => {
            if (!obj || typeof obj !== "object") return null

            for (const [k, v] of Object.entries(obj)) {
              const newPath = currentPath ? `${currentPath}.${k}` : k

              if (Array.isArray(v)) {
                for (let i = 0; i < v.length; i++) {
                  if (String(v[i]) === targetValue) {
                    return `${newPath}[${i}]`
                  }

                  if (typeof v[i] === "object" && v[i] !== null) {
                    const result = findArrayItemPath(
                      v[i],
                      targetValue,
                      `${newPath}[${i}]`
                    )
                    if (result) return result
                  }
                }
              } else if (typeof v === "object" && v !== null) {
                const result = findArrayItemPath(v, targetValue, newPath)
                if (result) return result
              }
            }

            return null
          }

          return findArrayItemPath(parsedYaml, arrayItemValue)
        }

        return null
      }

      const key = keyMatch[1].trim()

      const findPathToKey = (
        obj: Record<string, any>,
        targetKey: string,
        currentPath = "",
        context: { lineNumber: number; indent: number } | null = null
      ): string | null => {
        if (!obj || typeof obj !== "object") return null

        const currentIndent = lineContent.search(/\S/)

        for (const [k, v] of Object.entries(obj)) {
          const newPath = currentPath ? `${currentPath}.${k}` : k

          if (k === targetKey) {
            if (context) {
              const range = findSectionRange(newPath)
              if (
                range &&
                Math.abs(range.lineNumber - position.lineNumber) <= 1
              ) {
                return newPath
              }
            } else {
              return newPath
            }
          }

          if (typeof v === "object" && v !== null) {
            if (Array.isArray(v)) {
              for (let i = 0; i < v.length; i++) {
                if (typeof v[i] === "object" && v[i] !== null) {
                  const result = findPathToKey(
                    v[i],
                    targetKey,
                    `${newPath}[${i}]`,
                    context
                  )
                  if (result) return result
                }
              }
            } else {
              const result = findPathToKey(v, targetKey, newPath, context)
              if (result) return result
            }
          }
        }

        return null
      }

      const contextPath = findPathToKey(parsedYaml, key, "", {
        lineNumber: position.lineNumber,
        indent: lineContent.search(/\S/),
      })
      if (contextPath) return contextPath

      return findPathToKey(parsedYaml, key)
    },
    [
      editorLineMap,
      parsedYaml,
      findSectionRange,
      isEditorReady,
      idData.current,
      editorRef.current,
    ]
  )

  // Scroll the sidebar to make the selected item visible
  const scrollSidebarToSelectedItem = useCallback(() => {
    setTimeout(() => {
      if (selectedSection) {
        const selectedElement = document.querySelector(`[data-active="true"]`)
        if (selectedElement && sidebarTreeRef.current) {
          // Get the position of the selected element relative to the sidebar
          const elementRect = selectedElement.getBoundingClientRect()
          const sidebarRect = sidebarTreeRef.current.getBoundingClientRect()

          // Check if the element is outside the visible area of the sidebar
          if (
            elementRect.top < sidebarRect.top ||
            elementRect.bottom > sidebarRect.bottom
          ) {
            // Scroll the element into view with smooth behavior
            selectedElement.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            })
          }
        }
      }
    }, 100) // Small delay to ensure DOM is updated
  }, [selectedSection])

  // Navigate to a specific section in the editor
  const navigateToSection = useCallback(
    (section: string, item?: string) => {
      if (!editorRef.current || !monacoRef.current) return

      const range = findSectionRange(section, item)
      if (!range) return

      if (activeDecorations.length > 0) {
        editorRef.current.deltaDecorations(activeDecorations, [])
      }

      const decorations = editorRef.current.deltaDecorations(
        [],
        [
          {
            range: new monacoRef.current.Range(
              range.startLine,
              1,
              range.endLine,
              1
            ),
            options: {
              className: "yaml-section-highlight",
              isWholeLine: true,
            },
          },
        ]
      )

      setActiveDecorations(decorations)

      editorRef.current.revealLineInCenter(range.lineNumber)

      const model = editorRef.current.getModel()
      if (!model) return

      const lineContent = model.getLineContent(range.lineNumber)

      if (item) {
        const keyPosition = lineContent.indexOf(item + ":")
        const valuePosition = lineContent.indexOf(":", keyPosition) + 1
        editorRef.current.setPosition({
          lineNumber: range.lineNumber,
          column: valuePosition + 1,
        })
      } else {
        const keyMatch = section.split(".").pop()
        if (keyMatch) {
          const keyPosition = lineContent.indexOf(keyMatch)
          editorRef.current.setPosition({
            lineNumber: range.lineNumber,
            column: keyPosition + 1,
          })
        }
      }

      editorRef.current.focus()

      const fullPath = section + (item ? "." + item : "")
      setSelectedSection(fullPath)

      // Expand all parent paths
      const expandAllParentPaths = (path: string) => {
        const parts = path.split(".")
        let currentPath = ""

        // Handle all path segments including array notation
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i]

          // Handle array notation
          if (part.includes("[")) {
            const arrayPart = part.split("[")[0]
            // Add the array name to expanded sections
            const arrayPath = currentPath
              ? `${currentPath}.${arrayPart}`
              : arrayPart
            // setExpandedSections((prev) => new Set([...prev, arrayPath]))

            // Add the full path with array index
            currentPath = currentPath ? `${currentPath}.${part}` : part
          } else {
            // Regular path segment
            currentPath = currentPath ? `${currentPath}.${part}` : part
          }

          // setExpandedSections((prev) => new Set([...prev, currentPath]))
        }
      }

      expandAllParentPaths(section)

      scrollSidebarToSelectedItem()
    },
    [findSectionRange, activeDecorations, scrollSidebarToSelectedItem]
  )
  // Improve the highlightTreeForEditorSelection function to better handle deeply nested items
  // and ensure the sidebar is properly opened
  // Replace the highlightTreeForEditorSelection function with this improved version
  // that properly expands all parent nodes in the navigation tree
  const highlightTreeForEditorSelection = useCallback(
    (position: Position | null) => {
      if (parseError) return
      if (!editorRef.current || !position) return
      const path = findPathForPosition(position)
      if (!path) return

      // Set the selected section
      setSelectedSection(path)

      // Expand all parent paths with a completely different approach
      const expandParentPaths = (fullPath: string) => {
        // Split the path into segments
        const segments = fullPath.split(".")

        // Create an array to hold all parent paths that need to be expanded
        const pathsToExpand = new Set<string>()

        // Build up paths incrementally
        let currentPath = ""
        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i]

          // Handle array notation
          if (segment.includes("[")) {
            // Add the path without the array index
            const baseName = segment.split("[")[0]
            const baseSegment = currentPath
              ? `${currentPath}.${baseName}`
              : baseName
            pathsToExpand.add(baseSegment)

            // Add the full segment with array index
            currentPath = currentPath ? `${currentPath}.${segment}` : segment
          } else {
            // Regular path segment
            currentPath = currentPath ? `${currentPath}.${segment}` : segment
          }

          // Add the current path to the set of paths to expand
          pathsToExpand.add(currentPath)
        }

        // Update the expanded sections state with all parent paths
        setExpandedSections((prev) => new Set([...prev, ...pathsToExpand]))
      }

      // Expand all parent paths
      expandParentPaths(path)

      // Ensure sidebar is open
      // if (sidebarCollapsed) {
      //   setSidebarCollapsed(false)
      // }

      // Scroll to the selected item with a delay to ensure DOM updates
      setTimeout(() => {
        const selectedElement = document.querySelector(`[data-path="${path}"]`)
        if (selectedElement && sidebarTreeRef.current) {
          // First make sure the element is in view
          selectedElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          })

          // Then ensure it's fully visible by checking its position relative to the sidebar
          const sidebarRect = sidebarTreeRef.current.getBoundingClientRect()
          const elementRect = selectedElement.getBoundingClientRect()

          // Add extra padding to ensure the element is clearly visible
          const padding = 20

          if (elementRect.bottom > sidebarRect.bottom) {
            // Element is below the visible area
            sidebarTreeRef.current.scrollTop +=
              elementRect.bottom - sidebarRect.bottom + padding
          } else if (elementRect.top < sidebarRect.top) {
            // Element is above the visible area
            sidebarTreeRef.current.scrollTop -=
              sidebarRect.top - elementRect.top + padding
          }
        }
      }, 200) // Longer delay to ensure DOM updates
    },
    [
      findPathForPosition,
      setExpandedSections,
      setSelectedSection,
      sidebarCollapsed,
      idData.current,
      isEditorReady,
    ]
  )

  // Handle text selection in the editor
  const handleEditorSelection = useCallback(() => {
    if (!editorRef.current) return

    const selection = editorRef.current.getSelection()
    if (!selection || selection.isEmpty()) return

    const position = {
      lineNumber: selection.startLineNumber,
      column: selection.startColumn,
    }

    highlightTreeForEditorSelection(position)
  }, [highlightTreeForEditorSelection])

  // Get icon for a specific node based on its level and type
  const getNodeIcon = useCallback((nodeName: string, level: number) => {
    if (SECTION_ICONS[nodeName]) {
      const IconComponent = SECTION_ICONS[nodeName]
      return <IconComponent className="h-4 w-4 shrink-0" />
    }

    const LevelIcon = LEVEL_ICONS[level] || null
    return LevelIcon && <LevelIcon className="h-4 w-4 shrink-0" />
  }, [])

  // Recursively render the YAML tree
  const renderYamlTree = useCallback(
    (
      data: Record<string, any>,
      path = "",
      level = 0,
      id?: string,
      index?: string
    ) => {
      if (!data || typeof data !== "object") return null

      return Object.entries(data).map(([key, value], index) => {
        const currentPath = path ? `${path}.${key}` : key
        const isExpanded = expandedSections.has(currentPath)
        const isActive = selectedSection === currentPath

        const handleSectionClick = (e: React.MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
          // Toggle section expansion if clicking on the same section
          if (isExpanded) {
            toggleSectionExpansion(currentPath, false) // Collapse
          } else {
            toggleSectionExpansion(currentPath, true) // Expand
          }
          if (id === idData.current) navigateToSection(currentPath)
          // Navigate to section
          if (id !== idData.current) {
            // Set ID if applicable
            idData.current = id
            const requiredMeta = metaYamlData.filter((el) => el.id === id)
            nameData.current = requiredMeta[0].metadata_name
            const requiredValue = `${requiredMeta[0].metadata_name}:\n  ${
              requiredMeta[0]?.content?.replaceAll("\n", "\n  ") || ""
            }`
            setYamlData(requiredValue)
            editorRef.current && editorRef.current.setValue(requiredValue)
            validateYaml(requiredValue)
            navigateToSection(currentPath)
          }
        }
        if (Array.isArray(value)) {
          return (
            <div key={currentPath} className="mb-1">
              <div
                className={`flex items-center gap-1 cursor-pointer p-1 transition-all hover:bg-accent/70 hover:text-accent-foreground rounded-md ${
                  isActive
                    ? "bg-primary/15 text-primary font-medium"
                    : "font-semibold text-txt-color-300"
                }`}
                onClick={handleSectionClick}
                data-active={isActive}
                data-path={currentPath}
              >
                <div className="flex items-center cursor-pointer">
                  {sidebarCollapsed ? (
                    <ChevronDown
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleSectionExpansion(currentPath, false) // Collapse
                      }}
                      className="h-4 w-4"
                    />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
                {getNodeIcon(key, level) && getNodeIcon(key, level)}
                <span
                  className={cn(
                    isActive
                      ? "font-semibold"
                      : "font-medium text-txt-color-300"
                  )}
                >
                  {key}
                </span>
              </div>
              {isExpanded && (
                <div className="pl-4">
                  <ul className="space-y-1">
                    {value.map((item: any, index: number) => (
                      <li key={`${currentPath}-${index}`}>
                        <div
                          className={`flex items-center gap-2 pl-2 py-1 transition-all hover:bg-accent/70 hover:text-accent-foreground rounded-md cursor-pointer ${
                            selectedSection === `${currentPath}[${index}]`
                              ? "bg-primary/15 text-primary font-semibold"
                              : "font-medium text-txt-color-300"
                          }`}
                          data-active={
                            selectedSection === `${currentPath}[${index}]`
                          }
                          data-path={`${currentPath}[${index}]`}
                          onClick={handleSectionClick}
                        >
                          {getNodeIcon("item", level + 1)}
                          <span
                            className={`truncate ${
                              selectedSection === `${currentPath}[${index}]`
                                ? "text-primary font-semibold"
                                : " font-medium text-txt-color-300"
                            }`}
                          >
                            {typeof item === "string"
                              ? item
                              : `Item ${index + 1}`}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        }
        if (typeof value === "object" && value !== null) {
          return (
            <div key={currentPath} className="mb-1 text-sm leading-3">
              <div
                className={cn(
                  "flex items-center gap-1 cursor-pointer p-1 transition-all hover:bg-accent/70 hover:text-accent-foreground rounded-md",
                  isActive
                    ? "bg-primary/15 text-primary font-semibold px-1"
                    : "font-medium text-txt-color-300 px-1"
                )}
                onClick={handleSectionClick}
                data-active={isActive}
                data-path={currentPath}
              >
                <div className="flex items-center cursor-pointer">
                  {isExpanded ? (
                    <ChevronDown
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleSectionExpansion(currentPath, false) // Collapse
                      }}
                      className="h-4 w-4"
                    />
                  ) : (
                    <ChevronRight
                      aria-label={`${metadataType}-expand-button-${index}`}
                      className="h-4 w-4"
                    />
                  )}
                </div>
                {getNodeIcon(key, level)}
                <div
                  data-testid={`metadata-${metadataType}-${index}`}
                  className={cn("flex justify-between w-full gap-2")}
                >
                  {level === 0 && isEditing && editId === id ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                      }}
                      className="bg-red-400"
                    >
                      {" "}
                      <input
                        className="flex h-6 mt-[1px] w-full rounded-sm bg-transparent px-2 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-txt-color-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        ref={inputRef}
                        autoFocus={true}
                        defaultValue={key}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setEditId("")
                          }
                        }}
                        onBlur={() => {
                          setEditId("")
                        }}
                        onChange={(e) => {
                          setValue(e.target.value)
                          const lines = editorRef.current.getValue().split("\n")
                          lines[0] = `${e.target.value}:`
                          editorRef.current.setValue(lines.join("\n"))
                        }}
                      />
                    </div>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            // style={{
                            //   maxWidth: "200px",
                            // }}
                            className={cn(
                              isActive
                                ? "font-semibold"
                                : "font-medium text-txt-color-300",
                              "truncate whitespace-nowrap overflow-hidden flex-1 w-[18px] text-sm pr"
                            )}
                          >
                            {key}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent
                          style={{ maxWidth: "628px", wordWrap: "break-word" }}
                        >
                          {key}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {level === 0 && editId !== id && !isViewOnly && (
                    <div className="hover:bg-transparent flex gap-2 items-center shrink-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <SquarePen
                              size={16}
                              onClick={(e) => {
                                // e.stopPropagation()
                                // e.preventDefault()
                                // setisEditing(true)
                                inputRef.current?.focus()
                                inputRef.current?.select()
                                // should refactor later
                                if (isEditorReady) {
                                  setEditId(id)
                                } else {
                                  setTimeout(() => setEditId(id), 500)
                                }
                              }}
                              className="hover:text-primary text-txt-color-300 outline-none scale-x-[-1]"
                            />
                          </TooltipTrigger>
                          <TooltipContent>Edit Name</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {deleteId === id ? (
                        customLoader ? (
                          <Image
                            id="deleting-loader"
                            className="mr-2"
                            src={customLoader}
                            width={18}
                            height={18}
                            alt="deleting"
                          />
                        ) : (
                          <Loader2
                            size={18}
                            color="#000000"
                            className="animate-spin"
                          />
                        )
                      ) : (
                        <AlertDialog>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger
                                  asChild
                                  onClick={(e) => {
                                    e?.stopPropagation()
                                  }}
                                >
                                  {editId !== id && (
                                    <Trash2
                                      size={16}
                                      className="mr-2 hover:text-destructive text-txt-color-300 outline-none"
                                    />
                                  )}
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <AlertDialogContent
                            onClick={(e) => e.stopPropagation()}
                            className="gap-4 text-txt-color-200"
                          >
                            <AlertDialogHeader
                              className="flex flex-col items-center p-0 gap-4 w-full self-stretch 
                "
                            >
                              <AlertDialogTitle className="flex flex-col">
                                <p className="font-poppins text-headline-xs text-center text-black-100 !-mb-2">
                                  {` Delete ${
                                    metadataType
                                      .slice(0, 1)
                                      .toUpperCase()
                                      .concat(metadataType.substring(1)) ||
                                    "Metadata"
                                  }`}
                                </p>
                              </AlertDialogTitle>
                              <AlertDialogDescription className="m-0 flex flex-col items-center justify-center gap-1 ">
                                <p className="text-body-lg text-center text-black-100 self-stretch">
                                  {`Are you sure you want to delete the ${
                                    metadataType || "metadata"
                                  }?`}
                                </p>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="w-full">
                              <div
                                className="flex flex-row p-2 self-stretch w-full items-center justify-center
                 sm:space-x-2"
                              >
                                {" "}
                                <div className="flex flex-row items-center gap-3">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>

                                  <Button
                                    variant="default"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      getidData(id)
                                    }}
                                  >
                                    Continue
                                  </Button>
                                  {/* <AlertDialogAction
                                    className="bg-destructive text-white hover:bg-destructive-foreground"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      getidData(id)
                                    }}
                                  >
                                    Delete
                                  </AlertDialogAction> */}
                                </div>
                                <AlertDialogCancel className="absolute right-2 top-4 border-none">
                                  <X className="h-5 w-5" />
                                </AlertDialogCancel>
                              </div>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {isExpanded && (
                <div className="pl-4">
                  {renderYamlTree(value, currentPath, level + 1, id)}
                </div>
              )}
            </div>
          )
        }

        // Handle primitive values (strings, numbers, etc.)
        return (
          <div key={currentPath} className="mb-0 text-sm leading-4">
            <div
              className={`flex items-center gap-2 ${
                level > 0 ? "pl-" + level * 1 : ""
              } py-1 transition-all hover:bg-accent/70 hover:text-accent-foreground rounded-md cursor-pointer text-md pl-2`}
              data-active={selectedSection === `${path}.${key}`}
              data-path={`${path}.${key}`}
              onClick={handleSectionClick}
            >
              {getNodeIcon(key, level)}
              <span
                className={` ${
                  selectedSection === `${path}.${key}`
                    ? "font-semibold text-primary"
                    : "font-medium text-txt-color-300"
                }`}
              >
                {key}:
              </span>
              <span
                className={`truncate max-w-[20dvw] ${
                  selectedSection === `${path}.${key}`
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {String(value)}
              </span>
            </div>
          </div>
        )
      })
    },
    [
      metaYamlData,
      yamlData,
      expandedSections,
      selectedSection,
      navigateToSection,
      toggleSectionExpansion,
      getNodeIcon,
      deleteId,
      editId,
      inputRef.current,
    ]
  )

  // Get lines from editor
  const lines = useMemo(() => {
    if (!editorRef.current) return []
    const model = editorRef.current.getModel()
    if (!model) return []
    return model.getValue().split("\n")
  }, [])

  // Initialize expanded sections
  // useEffect(() => {
  //   if (
  //     parsedYaml &&
  //     Object.keys(parsedYaml).length > 0 &&
  //     expandedSections.size === 0
  //   ) {
  //     const topLevelSections = new Set(Object.keys(parsedYaml))
  //     setExpandedSections(topLevelSections)
  //   }
  // }, [parsedYaml, expandedSections.size])

  // Preserve expanded sections when YAML changes
  useEffect(() => {
    if (!parsedYaml) return

    const pathExists = (path: string): boolean => {
      const segments = path.split(".")
      let current = parsedYaml

      for (const segment of segments) {
        const arrayMatch = segment.match(/(.+)\[(\d+)\]$/)
        if (arrayMatch) {
          const arrayName = arrayMatch[1]
          const arrayIndex = Number.parseInt(arrayMatch[2], 10)

          if (
            !current[arrayName] ||
            !Array.isArray(current[arrayName]) ||
            arrayIndex >= current[arrayName].length
          ) {
            return false
          }
          current = current[arrayName][arrayIndex]
        } else if (current && current[segment] === undefined) {
          return false
        } else {
          if (current) {
            current = current[segment]
          } else {
            return false
          }
        }
      }
      return true
    }

    setExpandedSections((prev) => {
      const newSet = new Set<string>()
      for (const path of prev as any) {
        if (pathExists(path)) {
          newSet.add(path)
        }
      }
      return newSet
    })
  }, [parsedYaml])

  // Handle clicks outside the selected area
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeDecorations.length > 0 && editorRef.current) {
        const editorElement = editorRef.current.getDomNode()
        const sidebarElement = document.querySelector(".yaml-structure")
        const dialogElement = document.querySelector(".dialog")
        const buttonElements = Array.from(document.querySelectorAll("button"))

        if (
          (sidebarElement && sidebarElement.contains(e.target as Node)) ||
          (dialogElement && dialogElement.contains(e.target as Node)) ||
          buttonElements.some((button) => button.contains(e.target as Node))
        ) {
          return
        }

        if (editorElement && editorElement.contains(e.target as Node)) {
          editorRef.current.deltaDecorations(activeDecorations, [])
          setActiveDecorations([])
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [activeDecorations])

  // Add event listener for cursor position changes in the editor
  useEffect(() => {
    if (!editorRef.current) return

    const disposable = editorRef.current.onDidChangeCursorPosition((e) => {
      highlightTreeForEditorSelection(e.position)

      // Update editor stats
      if (editorRef.current) {
        const position = editorRef.current.getPosition()
        if (position) {
          setEditorStats((prev) => ({
            ...prev,
            currentLine: position.lineNumber,
            currentColumn: position.column,
          }))
        }
      }
    })

    return () => {
      disposable.dispose()
    }
  }, [highlightTreeForEditorSelection])

  // Add event listener for selection changes in the editor
  useEffect(() => {
    if (!editorRef.current) return

    const disposable = editorRef.current.onDidChangeCursorSelection((e) => {
      handleEditorSelection()

      // Update selection length
      const selection = editorRef?.current?.getSelection()
      if (selection) {
        const model = editorRef?.current?.getModel()
        if (model) {
          const selectionText = model.getValueInRange(selection)
          setEditorStats((prev) => ({
            ...prev,
            selectionLength: selectionText.length,
          }))
        }
      }
    })

    return () => {
      disposable.dispose()
    }
  }, [handleEditorSelection])

  // Add styles for hover and selected states in the tree
  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.textContent = `
      .yaml-error-highlight {
        background-color: rgba(255, 0, 0, 0.2);
        border-bottom: 1px wavy red;
      }
      .yaml-error-glyph {
        background-color: red;
        border-radius: 50%;
        margin-left: 5px;
      }
      .yaml-section-highlight {
        background-color: rgba(100, 100, 255, 0.2);
      }
      
      .fullscreen-editor {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 50;
        background-color: var(--background);
        transition: all 0.3s ease;
      }
      
      .status-bar {
        display: flex;
        align-items: center;
        padding: 0 1rem;
        height: 28px;
        font-size: 12px;
        background-color: hsl(var(--muted));
        color: hsl(var(--muted-foreground));
        border-top: 1px solid hsl(var(--border));
      }
      
      .status-bar-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0 0.5rem;
      }
      
      .status-bar-item:not(:last-child) {
        border-right: 1px solid hsl(var(--border));
      }
      
      .theme-toggle {
        position: relative;
        width: 40px;
        height: 20px;
        border-radius: 10px;
        background-color: hsl(var(--muted));
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .theme-toggle::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: hsl(var(--primary));
        transition: all 0.3s ease;
      }
      
      .theme-toggle[data-theme="dark"]::after {
        transform: translateX(20px);
      }
      
      .keyboard-shortcuts-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 500px;
        max-width: 90vw;
        max-height: 80vh;
        overflow-y: auto;
        background-color: hsl(var(--background));
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 100;
        padding: 1.5rem;
      }
      
      .keyboard-shortcuts-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 99;
      }
      
      .keyboard-shortcut-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid hsl(var(--border));
      }
      
      .keyboard-shortcut-key {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        height: 24px;
        padding: 0 6px;
        background-color: hsl(var(--muted));
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        margin-left: 0.5rem;
      }
      
      .editor-toolbar {
        display: flex;
        align-items: center;
        padding: 0.5rem;
        background-color: hsl(var(--card));
        border-bottom: 1px solid hsl(var(--border));
        gap: 0.5rem;
      }
      
      .toolbar-group {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
      
      .toolbar-group:not(:last-child) {
        margin-right: 0.5rem;
        padding-right: 0.5rem;
        border-right: 1px solid hsl(var(--border));
      }

    .yaml-structure {
  display: flex;
  flex-direction: column;
  height: 100%,
  overflow: hidden;
}
      .yaml-structure-collapsed {
  display: flex;
  flex-direction: column;
    max-height: 100%  /* Adjust height dynamically */
}

.yaml-structure-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white; /* Ensure background is set to avoid transparency */
  padding: 8px 4px;
  height:40px;
  border-bottom: 1px solid #ddd; /* Optional for separation */
}
.yaml-structure-header-fullscreen {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white; /* Ensure background is set to avoid transparency */
  padding: 8px 4px;
  height:55.5px;
  border-bottom: 1px solid #ddd; /* Optional for separation */
}

.yaml-structure-content {
  // flex-grow: 1;
    // max-height: calc(100dvh - 256px); /* Adjust height dynamically */
  max-width: 100%;
  overflow-y: auto;
}
  
  .editor-container {
  display: flex;
  flex-direction: column;
    max-height: calc(100dvh - 256px); /* Adjust height dynamically */
}
      .editor-container-full {
  display: flex;
  flex-direction: column;
    max-height: 100%  /* Adjust height dynamically */
}

.status-bar {
  height: 32px; /* Fixed height */
  flex-shrink: 0; /* Prevents collapsing */
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f3f4f6;
  padding: 0 10px;
  border-top: 1px solid #ccc;
}


    `
    document.head.appendChild(styleElement)

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement)
      }
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.altKey && e.key === "F") {
        e.preventDefault()
        formatYamlDocument()
      }
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault()
        copyToClipboard()
      }
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault()
        downloadYaml()
      }
      if (e.key === "F11") {
        e.preventDefault()
        toggleFullScreen()
      }
      if (e.key === "Escape" && isFullScreen) {
        e.preventDefault()
        setIsFullScreen(false)
      }
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault()
        setShowKeyboardShortcuts(true)
      }
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault()
        toggleSidebar()
      }
      if (e.ctrlKey && e.key === "m") {
        e.preventDefault()
        toggleThemeData()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [
    formatYamlDocument,
    copyToClipboard,
    downloadYaml,
    toggleFullScreen,
    isFullScreen,
    toggleSidebar,
    toggleThemeData,
  ])

  // Configure Monaco Editor for YAML
  const configureMonaco = useCallback(
    (monaco: typeof import("monaco-editor")) => {
      monaco.languages.registerCompletionItemProvider("yaml", {
        provideCompletionItems: (model, position) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          })

          const lines = textUntilPosition.split("\n")
          const currentLine = lines[position.lineNumber - 1]
          const indentMatch = currentLine.match(/^(\s*)/)
          const indent = indentMatch ? indentMatch[1].length : 0
          const indentLevel = Math.floor(indent / 2)

          const suggestions: monaco.languages.CompletionItem[] = []

          const addSuggestion = (
            label: string,
            insertText: string,
            detail: string,
            documentation: string
          ) => {
            suggestions.push({
              label,
              kind: monaco.languages.CompletionItemKind.Property,
              insertText,
              detail,
              documentation,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column,
                endColumn: position.column,
              },
            })
          }

          const yamlObject = parse(textUntilPosition)

          const getSuggestionsForObject = (
            obj: any,
            currentPath: string[] = []
          ) => {
            if (typeof obj === "object" && obj !== null) {
              for (const [key, value] of Object.entries(obj)) {
                const newPath = [...currentPath, key]
                const fullPath = newPath.join(".")
                if (typeof value === "object" && value !== null) {
                  if (Array.isArray(value)) {
                    addSuggestion(
                      `${key}:`,
                      `${key}:\n${" ".repeat((indentLevel + 1) * 2)}- `,
                      `Add ${fullPath} array`,
                      `Add a new item to the ${fullPath} array`
                    )
                  } else {
                    addSuggestion(
                      `${key}:`,
                      `${key}:\n${" ".repeat((indentLevel + 1) * 2)}`,
                      `Add ${fullPath} object`,
                      `Add a new ${fullPath} object`
                    )
                  }
                  getSuggestionsForObject(value, newPath)
                } else {
                  addSuggestion(
                    `${key}:`,
                    `${key}: `,
                    `Add ${fullPath}`,
                    `Add a new ${fullPath} property`
                  )
                }
              }
            }
          }

          getSuggestionsForObject(yamlObject)

          return {
            suggestions: suggestions,
          }
        },
      })

      monaco.languages.registerHoverProvider("yaml", {
        provideHover: (model, position) => {
          const word = model.getWordAtPosition(position)
          if (!word) return null

          const lineContent = model.getLineContent(position.lineNumber)
          const path = findPathForPosition({
            lineNumber: position.lineNumber,
            column: position.column,
          })

          if (!path) return null

          const getValueAtPath = (obj: any, path: string): any => {
            const parts = path.split(".")
            let current = obj
            for (const part of parts) {
              if (current[part] !== undefined) {
                current = current[part]
              } else {
                return undefined
              }
            }
            return current
          }

          const value = getValueAtPath(parsedYaml, path)
          const type = Array.isArray(value) ? "array" : typeof value

          const hoverContent = [
            { value: `**${word.word}**` },
            { value: `Type: ${type}` },
          ]

          if (type === "object") {
            const keys = Object.keys(value)
            hoverContent.push({ value: `Properties: ${keys.join(", ")}` })
          } else if (type === "array") {
            hoverContent.push({ value: `Length: ${value.length}` })
          } else {
            hoverContent.push({ value: `Value: ${JSON.stringify(value)}` })
          }

          return {
            contents: hoverContent,
          }
        },
      })

      monaco.languages.registerDocumentFormattingEditProvider("yaml", {
        provideDocumentFormattingEdits: (model) => {
          try {
            const text = model.getValue()
            const parsed = parse(text)
            const formatted = stringify(parsed, { indent: 2 })

            return [
              {
                range: model.getFullModelRange(),
                text: formatted,
              },
            ]
          } catch (e) {
            return []
          }
        },
      })

      monaco.editor.defineTheme("yamlCustomTheme", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment.yaml", foreground: "6A9955" },
          { token: "string.yaml", foreground: "CE9178" },
          { token: "keyword.yaml", foreground: "569CD6" },
          { token: "number.yaml", foreground: "B5CEA8" },
        ],
        colors: {
          "editor.background": "#FFFFFF",
          "editor.foreground": "#D4D4D4",
          "editorCursor.foreground": "#AEAFAD",
          "editor.lineHighlightBackground": "#2D2D30",
          "editorLineNumber.foreground": "#858585",
          "editor.selectionBackground": "#264F78",
          "editor.inactiveSelectionBackground": "#3A3D41",
        },
      })

      const styleElement = document.createElement("style")
      styleElement.textContent = `
      .yaml-error-highlight {
        background-color: rgba(255, 0, 0, 0.2);
        border-bottom: 1px wavy red;
      }
      .yaml-error-glyph {
        background-color: red;
        border-radius: 50%;
        margin-left: 5px;
      }
      .yaml-section-highlight {
        background-color: rgba(100, 100, 255, 0.2);
      }
    `
      document.head.appendChild(styleElement)
    },
    [findPathForPosition, parsedYaml]
  )

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    configureMonaco(monaco)
    // validateYaml(yamlData)

    editor.onDidChangeModelContent(() => {
      const currentValue = editor.getValue()
      validateYaml(currentValue)
    })

    // monaco.editor.setTheme("yamlCustomTheme")

    // Update editor stats
    const model = editor.getModel()
    if (model) {
      const lineCount = model.getLineCount()
      const content = model.getValue()
      const bytes = new Blob([content]).size
      let fileSize = ""
      if (bytes < 1024) {
        fileSize = `${bytes} B`
      } else if (bytes < 1024 * 1024) {
        fileSize = `${(bytes / 1024).toFixed(1)} KB`
      } else {
        fileSize = `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      }

      setEditorStats({
        lineCount,
        currentLine: 1,
        currentColumn: 1,
        fileSize,
        selectionLength: 0,
      })
    }

    setIsEditorReady(true)
  }
  // useEffect(() => {
  //   if (!idData.current) {
  //     setIsFullScreen(false)
  //   }
  // }, [idData.current])
  // useEffect(() => {
  //   if (metaYamlData && metaYamlData.length > 0) {
  //     idData.current = metaYamlData[0].id
  //     editorRef &&
  //       editorRef.current &&
  //       editorRef.current.setValue(
  //         `${metaYamlData[0]?.metadata_name}:\n  ${
  //           metaYamlData[0]?.content?.replaceAll("\n", "\n  ") || ""
  //         }`
  //       )
  //     formatYamlDocument()
  //   }
  // }, [isEditorReady, metaYamlData])
  // useEffect(() => {
  //   if (metaYamlData && metaYamlData.length > 0) {
  //     const requiredSection = metaYamlData.filter((el) => el.id === idData)
  //     if (requiredSection.length)
  //       setSelectedSection(requiredSection[0].metadata_name)
  //   }
  // }, [idData, isEditorReady])

  // Render keyboard shortcuts modal
  const renderKeyboardShortcuts = () => {
    if (!showKeyboardShortcuts) return null

    const shortcuts = [
      { key: "Shift + Alt + F", description: "Format YAML document" },
      { key: "Ctrl + Shift + C", description: "Copy YAML to clipboard" },
      { key: "Ctrl + S", description: "Download YAML file" },
      { key: "F11", description: "Toggle fullscreen mode" },
      { key: "Escape", description: "Exit fullscreen mode" },
      { key: "Ctrl + K", description: "Show keyboard shortcuts" },
      { key: "Ctrl + F", description: "Search in document" },
      { key: "Ctrl + G", description: "Go to line" },
      { key: "Ctrl + /", description: "Toggle comment" },
      { key: "Ctrl + Space", description: "Trigger suggestions" },
      { key: "Ctrl + B", description: "Toggle sidebar" },
      // { key: "Ctrl + M", description: "Toggle theme" },
    ]

    return (
      <>
        <div
          className="keyboard-shortcuts-overlay"
          onClick={() => setShowKeyboardShortcuts(false)}
        ></div>
        <div className="keyboard-shortcuts-modal">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Keyboard shortcuts</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKeyboardShortcuts(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-x"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          </div>
          <div className="space-y-1">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="keyboard-shortcut-item">
                <span>{shortcut.description}</span>
                <div className="flex items-center">
                  {shortcut.key.split(" + ").map((key, keyIndex) => (
                    <React.Fragment key={keyIndex}>
                      <span className="keyboard-shortcut-key">{key}</span>
                      {keyIndex < shortcut.key.split(" + ").length - 1 && (
                        <span className="mx-1">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  // Render editor toolbar
  const renderEditorToolbar = () => {
    return (
      <div className="editor-toolbar">
        {metaYamlData.length > 0 && (
          <div className="flex">
            <div className="toolbar-group">
              {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={
                    editorRef &&
                    editorRef.current &&
                    !editorRef.current.getValue().trim()
                  }
                  variant="ghost"
                  size="sm"
                  onClick={formatYamlDocument}
                >
                  <FileCode className="h-4 w-4 mr-1" />
                  Format
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Format YAML document (Shift + Alt + F)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      aria-label="save-button-full-screen"
                      disabled={
                        isSaving ||
                        (editorRef &&
                          editorRef.current &&
                          !editorRef.current.getValue().trim()) ||
                        parseError
                      }
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs font-normal"
                      onClick={editorData}
                    >
                      {isSaving ? (
                        customLoader ? (
                          <Image
                            id="saving-loader"
                            src={customLoader}
                            width={14}
                            height={14}
                            alt="deleting"
                            className="mr-1 "
                          />
                        ) : (
                          <Loader2 size={14} className="mr-1 animate-spin" />
                        )
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}{" "}
                      Save
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save YAML document</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      disabled={
                        editorRef &&
                        editorRef.current &&
                        !editorRef.current.getValue().trim()
                      }
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs font-normal"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Copy YAML to clipboard (Ctrl + Shift + C)
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadYaml}
                      className="h-7 text-xs font-normal"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download YAML file (Ctrl + S)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="toolbar-group">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs font-normal"
                      onClick={exportToJson}
                    >
                      <FileJson className="h-4 w-4 mr-1 flex-shrink-0" />
                      Export to JSON
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export YAML as JSON</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="toolbar-group">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleMinimap}
                      className="h-7 text-xs font-normal"
                    >
                      <Map className="h-4 w-4 mr-1 flex-shrink-0" />
                      {showMinimap ? "Hide minimap" : "Show minimap"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {showMinimap ? "Hide code minimap" : "Show code minimap"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleWordWrap}
                      className="h-7 text-xs font-normal"
                    >
                      <Wrap className="h-4 w-4 mr-1 flex-shrink-0" />
                      {wordWrap === "on" ? "Disable wrap" : "Enable wrap"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {wordWrap === "on"
                      ? "Disable word wrap"
                      : "Enable word wrap"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}
        {/* <div className="toolbar-group">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKeyboardShortcuts(true)}
                  className="h-auto"
                >
                  <Keyboard className="h-4 w-4 mr-1" />
                  Shortcuts
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Show keyboard shortcuts (Ctrl + K)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div> */}

        <div className="ml-auto flex items-center gap-2">
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setThemeData(themeData === "dark" ? "light" : "dark")
                  }
                  className="flex items-center gap-2"
                >
                  {themeData === "dark" ? (
                    <>
                      <Sun className="h-4 w-4" />
                      <span className="hidden sm:inline">Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {themeData === "light" ? "Dark Mode" : "Light Mode"}
                      </span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Switch to {themeData === "dark" ? "light" : "dark"} mode
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullScreen}
                  className="flex items-center gap-2"
                >
                  {isFullScreen ? (
                    <>
                      <Minimize2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Exit fullscreen</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Fullscreen</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullScreen
                  ? "Exit fullscreen mode (Esc)"
                  : "Enter fullscreen mode (F11)"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    )
  }

  // Render status bar
  const renderStatusBar = () => {
    return (
      <div className="status-bar">
        <div className="status-bar-item">
          <span>Ln {editorStats.currentLine}</span>
        </div>
        <div className="status-bar-item">
          <span>Col {editorStats.currentColumn}</span>
        </div>
        {editorStats.selectionLength > 0 && (
          <div className="status-bar-item">
            <span>Selected: {editorStats.selectionLength} chars</span>
          </div>
        )}
        <div className="status-bar-item">
          <span>Lines: {editorStats.lineCount}</span>
        </div>
        <div className="status-bar-item">
          <span>Size: {editorStats.fileSize}</span>
        </div>
        <div className="status-bar-item">
          <span>Spaces: 2</span>
        </div>
        <div className="status-bar-item">
          <span>UTF-8</span>
        </div>
        <div className="status-bar-item ml-auto">
          <span>YAML</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        isFullScreen ? "fullscreen-editor" : "h-[70dvh] w-full",
        className
      )}
    >
      <ResizablePanelGroup direction="horizontal" className="h-full rounded-md">
        {!sidebarCollapsed && (
          <ResizablePanel
            defaultSize={sidebarSize}
            minSize={10}
            maxSize={16}
            onResize={(size) => setSidebarSize(size)}
            className={sidebarCollapsed ? "yaml-structure-collapsed" : ""}
          >
            <div
              className={cn(
                sidebarCollapsed
                  ? "yaml-structure-collapsed"
                  : "yaml-structure h-[70dvh] ",
                "h-full bg-white"
              )}
              ref={sidebarTreeRef}
            >
              <div
                className={cn(
                  isFullScreen
                    ? "yaml-structure-header-fullscreen"
                    : "yaml-structure-header"
                )}
              >
                <div className="flex flex-row items-center justify-between h-full">
                  <h2 className="text-lg font-medium text-primary">
                    YAML structure
                  </h2>
                  {!isViewOnly && (
                    <MetadataOptions
                      setDialog={setIsDialogOpen}
                      handleGenerate={() => {
                        idData.current = ""
                        nameData.current = ""
                        handleGenerate()
                      }}
                      addMetadata={() => {
                        addMetadata()
                        editorRef &&
                          editorRef.current &&
                          editorRef.current.setValue(
                            metadataType === "schema"
                              ? `Metadata_new_schema${Date.now()}:\n subject_area: [subject_area]\ntable_info:\n  - table: [table name]\n    joins: []\ncolumns:\n    [column_name]:\n      name: [column display name]\n      type: [data type only]\n      column: [column name]\n      desc: [description]\n      primary_key: [true/false]\n      foreign_key: [true/false]
`
                              : `Metadata_new_semantic${Date.now()}:\n  sources:\n 
    # Add your sources here\n
  hierarchies:\n 
    # Add your hierarchies here\n
  metrics:\n 
    # Add your metrics here\n
  attributes:\n 
    # Add your attributes here} `
                          )
                        idData.current = ""
                        nameData.current = ""
                        setSelectedSection(null)
                      }}
                      menuItems={{
                        regenerateFlag: metaYamlData && metaYamlData.length > 0,
                        generate: true,
                        upload: true,
                        addYaml: true,
                      }}
                      handleUploadClick={handleUploadMetadata}
                      metadataType={metadataType}
                    />
                  )}
                </div>
              </div>

              <div
                className={`${
                  isFullScreen
                    ? "h-full overflow-auto"
                    : "yaml-structure-content"
                } h-full overflow-auto`}
              >
                {Object.keys(myListOfYamlData).map((id, index) => {
                  return renderYamlTree(
                    myListOfYamlData[id],
                    "",
                    0,
                    metaYamlData && metaYamlData.length > 0
                      ? metaYamlData[index]?.id || ""
                      : "",
                    index.toString()
                  )
                })}
                {isFetchingList && (
                  <div className="relative flex items-center justify-center z-50">
                    <div className="flex flex-col items-center gap-2">
                      {customLoader ? (
                        <Image
                          id="fetching-loader"
                          src={customLoader}
                          width={35}
                          height={35}
                          alt="fetching"
                        />
                      ) : (
                        <Loader2
                          size={35}
                          color="#000000"
                          className="animate-spin"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        )}

        <ResizablePanel defaultSize={isFullScreen ? 100 : 100 - sidebarSize}>
          <div className="flex flex-col h-full">
            {!isFullScreen && (
              <div className="flex items-center h-10 px-4 border-b">
                <div className="flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          variant="chevron"
                          size="icon"
                          onClick={() => {
                            setSidebarCollapsed(!sidebarCollapsed)
                          }}
                          className="pt-1"
                        >
                          <ChevronRight
                            height={18}
                            width={18}
                            className={`transition-transform ${
                              !sidebarCollapsed ? "rotate-180" : ""
                            }`}
                          />
                          <span className="sr-only">Toggle sidebar</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {sidebarCollapsed ? "Expand" : "Collapse"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <h2 className="ml-2 text-lg font-medium text-primary">
                    YAML Editor
                  </h2>
                </div>
                {idData.current && !isViewOnly && (
                  <div className="ml-auto flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={exportToJson}
                            className="h-7 text-xs font-normal"
                          >
                            <FileJson className="h-4 w-4 mr-1 flex-shrink-0" />
                            Export to JSON
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Export YAML as JSON</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {/* <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          disabled={
                            editorRef &&
                            editorRef.current &&
                            !editorRef.current.getValue().trim()
                          }
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs font-normal"
                          onClick={formatYamlDocument}
                        >
                          <FileCode className="h-4 w-4 mr-1" />
                          Format
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Format YAML document (Shift + Alt + F)
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider> */}

                    {/* <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs font-normal"
                          onClick={() => {
                            if (editorRef.current) {
                              validateYaml(editorRef.current.getValue())
                            }
                          }}
                        >
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Validate
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Validate YAML syntax</TooltipContent>
                    </Tooltip>
                  </TooltipProvider> */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            aria-label="save-button-normal-screen"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs font-normal"
                            onClick={editorData}
                            disabled={
                              isSaving ||
                              (editorRef &&
                                editorRef.current &&
                                !editorRef.current.getValue().trim()) ||
                              parseError
                            }
                          >
                            {isSaving ? (
                              customLoader ? (
                                <Image
                                  id="deleting-loader"
                                  src={customLoader}
                                  width={14}
                                  height={14}
                                  alt="deleting"
                                  className="mr-1 "
                                />
                              ) : (
                                <Loader2
                                  size={14}
                                  className="mr-1 animate-spin"
                                />
                              )
                            ) : (
                              <Save className="h-4 w-4 mr-1" />
                            )}{" "}
                            Save
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Save YAML document</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs font-normal"
                            disabled={
                              editorRef &&
                              editorRef.current &&
                              !editorRef.current.getValue().trim()
                            }
                            onClick={copyToClipboard}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Copy YAML to clipboard (Ctrl + Shift + C)
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs font-normal"
                            onClick={downloadYaml}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Download YAML file (Ctrl + S)
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs font-normal"
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Settings</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {idData.current && (
                          <DropdownMenuItem onClick={toggleFullScreen}>
                            {isFullScreen ? (
                              <>
                                <Minimize2 className="h-4 w-4 mr-2" />
                                Exit fullscreen
                              </>
                            ) : (
                              <>
                                <Maximize2 className="h-4 w-4 mr-2" />
                                Fullscreen mode
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        {/* <DropdownMenuItem
                          onClick={() =>
                            setThemeData(
                              themeData === "dark" ? "light" : "dark"
                            )
                          }
                        >
                          {themeData === "dark" ? (
                            <>
                              <Sun className="h-4 w-4 mr-2" />
                              Light Mode
                            </>
                          ) : (
                            <>
                              <Moon className="h-4 w-4 mr-2" />
                              Dark Mode
                            </>
                          )}
                        </DropdownMenuItem> */}
                        <DropdownMenuItem onClick={toggleMinimap}>
                          <Map className="h-4 w-4 mr-2" />
                          {showMinimap ? "Hide minimap" : "Show minimap"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={toggleWordWrap}>
                          <Wrap className="h-4 w-4 mr-2" />
                          {wordWrap === "on"
                            ? "Disable word wrap"
                            : "Enable word wrap"}
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem
                        onClick={() => setShowKeyboardShortcuts(true)}
                      >
                        <Keyboard className="h-4 w-4 mr-2" />
                        Keyboard Shortcuts
                      </DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            )}

            {idData.current !== "" ? (
              <div className="flex-1 relative flex flex-col">
                {isFullScreen && renderEditorToolbar()}

                {parseError && (
                  <Alert
                    variant="destructive"
                    className={cn(
                      "w-60 absolute top-4 right-2 z-10 flex flex-wrap",
                      isFullScreen && "mt-12"
                    )}
                  >
                    <AlertCircle height={20} width={20} className="pb-1" />
                    <AlertDescription
                      className="font-bold hyphens-auto min-w-0"
                      style={{ wordBreak: "break-word" }}
                    >
                      {parseError}
                    </AlertDescription>
                  </Alert>
                )}

                <div
                  className={cn(
                    isFullScreen ? "editor-container-full" : "editor-container",
                    "flex flex-col h-full"
                  )}
                >
                  <div className="flex-1">
                    <Editor
                      height="100%" // Let the parent handle height
                      defaultLanguage="yaml"
                      defaultValue={yamlData}
                      theme={themeData === "dark" ? "vs-dark" : "vs-light"}
                      onMount={handleEditorDidMount}
                      options={{
                        hover: false,
                        isViewOnly: isViewOnly,
                        minimap: { enabled: showMinimap },
                        readOnly: isViewOnly,
                        domReadOnly: isViewOnly,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        wordWrap: wordWrap,
                        formatOnPaste: true,
                        formatOnType: true,
                        folding: true,
                        foldingStrategy: "indentation",
                        renderLineHighlight: "all",
                        renderWhitespace: "boundary",
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: true,
                        acceptSuggestionOnEnter: "on",
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        smoothScrolling: true,
                        contextmenu: true,
                        mouseWheelZoom: true,
                        bracketPairColorization: { enabled: true },
                        guides: { bracketPairs: true },
                        glyphMargin: true,
                        fixedOverflowWidgets: false,
                        selectOnLineNumbers: true,
                        lightbulb: { enabled: true },
                        colorDecorators: true,
                        semanticHighlighting: { enabled: true },
                        linkedEditing: true,
                        codeLens: true,
                        fontLigatures: true,
                        fontFamily: "'Poppins'",
                        fontSize: 14,
                        lineHeight: 22,
                        padding: { top: 10, bottom: 10 },
                        scrollbar: {
                          verticalScrollbarSize: 12,
                          horizontalScrollbarSize: 12,
                          verticalSliderSize: 12,
                          horizontalSliderSize: 12,
                          verticalHasArrows: false,
                          horizontalHasArrows: false,
                          arrowSize: 15,
                          useShadows: true,
                        },
                        find: { addExtraSpaceOnTop: false },
                      }}
                    />
                  </div>

                  {/* Status Bar - Fixed at the Bottom */}
                  <div className="status-bar bg-gray-100 text-sm p-2 border-t">
                    {renderStatusBar()}
                  </div>
                </div>

                {(!isEditorReady || isLoadingYaml) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      {customLoader ? (
                        <Image
                          id="deleting-loader"
                          src={customLoader}
                          width={48}
                          height={48}
                          alt="deleting"
                        />
                      ) : (
                        <Loader2
                          size={48}
                          color="#ffffff"
                          className="animate-spin"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 relative flex flex-col bg-white">
                {isFullScreen && renderEditorToolbar()}
                <div className="grow flex flex-col justify-center items-center">
                  <Image
                    key="metrics-editor-empty-state"
                    src="/images/empty-file-state.svg"
                    width={150}
                    height={150}
                    alt="Empty"
                  />
                  <p>
                    {metaYamlData && metaYamlData.length === 0
                      ? "No metrics available at this moment"
                      : "No metrics selected at this moment"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {showKeyboardShortcuts && renderKeyboardShortcuts()}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {metadataType === "schema"
                ? "Regenerate schema"
                : metadataType === "semantic"
                ? "Regenerate semantic"
                : "Regenerate metadata"}
            </DialogTitle>
          </DialogHeader>

          <p className="text-body-lg text-center text-black-100 self-stretch">
            {metadataType === "schema"
              ? "Do you want to regenerate schema? This will delete all your existing schema and semantic"
              : metadataType === "semantic"
              ? "Do you want to regenerate semantic? This will delete all your existing semantic"
              : "Do you want to regenerate metadata? This will delete all your existing metadata"}
          </p>
          <DialogFooter className="gap-4">
            <Button
              className="self-center flex justify-center items-center"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
              }}
            >
              Cancel
            </Button>

            <Button
              className="self-center flex justify-center items-center hover:bg-primaryhover"
              variant="default"
              onClick={() => {
                idData.current = ""
                nameData.current = ""
                handleGenerate()
                setIsDialogOpen(false)
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
