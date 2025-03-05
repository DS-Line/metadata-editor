"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import Editor from "@monaco-editor/react"
import { parse, stringify } from "yaml"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarHeader,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Database,
  Layers,
  BarChart3,
  Plus,
  File,
  Folder,
  FolderOpen,
  FileText,
  Settings,
  Users,
  Code,
  Globe,
  Briefcase,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Sample YAML data
const yamlData = `
# Company Information
company:
  name: Intelliome
  departments:
    # Engineering Department
    engineering:
      team_lead: Alice Johnson
      technologies:
        - Python
        - Django
        - Next.js
    # Marketing Department
    marketing:
      team_lead: Bob Smith
      strategies:
        - SEO
        - Content Marketing
        - Social Media
    # Sales Department
    sales:
      team_lead: Charlie Brown
      regions:
        - North America
        - Europe
        - Asia
`

// Section icons mapping with enhanced icons
const SECTION_ICONS = {
  company: Briefcase,
  departments: Database,
  engineering: Code,
  marketing: BarChart3,
  sales: Globe,
  technologies: Layers,
  strategies: Settings,
  regions: Globe,
  team_lead: Users,
}

// Level-based icons for tree hierarchy
const LEVEL_ICONS = {
  0: Folder,
  1: FolderOpen,
  2: FileText,
  3: File,
}

// Templates for different types of level 1 items
const TEMPLATES = {
  department: `    {name}:
      team_lead: Team Lead Name
      key_focus: Focus Area`,
  technology: `      - {name}`,
  strategy: `      - {name}`,
  region: `      - {name}`,
}

// Template for key-value pairs
const KEY_VALUE_TEMPLATE = `{key}: {value}`

export default function YamlEditor() {
  const editorRef = useRef(null)
  const monacoRef = useRef(null)
  const [parsedYaml, setParsedYaml] = useState({})
  const [parseError, setParseError] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)
  const [isAddingNewItem, setIsAddingNewItem] = useState(false)
  const [newItemType, setNewItemType] = useState(null)
  const [newItemName, setNewItemName] = useState("")
  const [newItemParent, setNewItemParent] = useState(null)
  const [newKeyValuePair, setNewKeyValuePair] = useState({ key: "", value: "" })
  const [expandedSections, setExpandedSections] = useState(new Set())

  // Enhanced YAML validation function
  const validateYaml = useCallback((yamlString) => {
    try {
      const parsed = parse(yamlString)
      setParsedYaml(parsed)
      setParseError(null)
      return { valid: true, parsed }
    } catch (error) {
      // Enhanced error message with line and column information
      const errorMessage = error.message || "Invalid YAML"
      let formattedError = errorMessage

      // Extract line and column information if available
      const lineMatch = errorMessage.match(/line (\d+)/)
      const colMatch = errorMessage.match(/column (\d+)/)

      if (lineMatch && colMatch) {
        const line = Number.parseInt(lineMatch[1])
        const col = Number.parseInt(colMatch[1])
        formattedError = `Error at line ${line}, column ${col}: ${errorMessage}`

        // Highlight the error in the editor
        if (editorRef.current && monacoRef.current) {
          const decorations = editorRef.current.deltaDecorations(
            [],
            [
              {
                range: new monacoRef.current.Range(line, col, line, col + 1),
                options: {
                  className: "yaml-error-highlight",
                  glyphMarginClassName: "yaml-error-glyph",
                  hoverMessage: { value: errorMessage },
                },
              },
            ],
          )

          // Remove decorations after 5 seconds
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.deltaDecorations(decorations, [])
            }
          }, 5000)
        }
      }

      setParseError(formattedError)
      return { valid: false, error: formattedError }
    }
  }, [])

  // Configure Monaco Editor for YAML
  const configureMonaco = useCallback((monaco) => {
    // Register YAML language features
    monaco.languages.registerCompletionItemProvider("yaml", {
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        })

        // Determine indentation level
        const indentMatch = textUntilPosition.match(/^(\s*)/)
        const indent = indentMatch ? indentMatch[1].length : 0
        const indentLevel = Math.floor(indent / 2)

        // Suggestions based on indentation level
        const suggestions = []

        // Level 0 suggestions (root level)
        if (indentLevel === 0) {
          suggestions.push({
            label: "company:",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "company:\n  ",
            detail: "Root company object",
            documentation: "The root company object containing all company information",
          })
        }

        // Level 1 suggestions (under company)
        else if (indentLevel === 1 && textUntilPosition.includes("company:")) {
          suggestions.push({
            label: "name:",
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: "name: ",
            detail: "Company name",
            documentation: "The name of the company",
          })
          suggestions.push({
            label: "departments:",
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: "departments:\n    ",
            detail: "Company departments",
            documentation: "The departments within the company",
          })
        }

        // Level 2 suggestions (under departments)
        else if (indentLevel === 2 && textUntilPosition.includes("departments:")) {
          suggestions.push({
            label: "engineering:",
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: "engineering:\n      team_lead: \n      technologies:\n        - ",
            detail: "Engineering department",
            documentation: "The engineering department information",
          })
          suggestions.push({
            label: "marketing:",
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: "marketing:\n      team_lead: \n      strategies:\n        - ",
            detail: "Marketing department",
            documentation: "The marketing department information",
          })
          suggestions.push({
            label: "sales:",
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: "sales:\n      team_lead: \n      regions:\n        - ",
            detail: "Sales department",
            documentation: "The sales department information",
          })
        }

        return {
          suggestions: suggestions,
        }
      },
    })

    // Register hover provider for YAML
    monaco.languages.registerHoverProvider("yaml", {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position)
        if (!word) return null

        const lineContent = model.getLineContent(position.lineNumber)

        // Check if the word is a key in our schema
        if (lineContent.includes("company:")) {
          return {
            contents: [
              { value: "**Company Information**" },
              { value: "The root object containing all company details." },
            ],
          }
        }

        if (lineContent.includes("departments:")) {
          return {
            contents: [{ value: "**Company Departments**" }, { value: "Contains all departments within the company." }],
          }
        }

        if (lineContent.includes("team_lead:")) {
          return {
            contents: [
              { value: "**Team Lead**" },
              { value: "The person responsible for leading this department or team." },
            ],
          }
        }

        return null
      },
    })

    // Register document formatting provider for YAML
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

    // Custom theme for YAML editor
    monaco.editor.defineTheme("yamlCustomTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment.yaml", foreground: "6A9955" },
        { token: "string.yaml", foreground: "CE9178" },
        { token: "keyword.yaml", foreground: "569CD6" },
        { token: "number.yaml", foreground: "B5CEA8" },
        { token: "newAddition", foreground: "00ff00" },
      ],
      colors: {
        "editor.background": "#1E1E1E",
        "editor.foreground": "#D4D4D4",
        "editorCursor.foreground": "#AEAFAD",
        "editor.lineHighlightBackground": "#2D2D30",
        "editorLineNumber.foreground": "#858585",
        "editor.selectionBackground": "#264F78",
        "editor.inactiveSelectionBackground": "#3A3D41",
      },
    })

    // Add CSS for error highlighting
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
    `
    document.head.appendChild(styleElement)
  }, [])

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Configure Monaco for YAML
    configureMonaco(monaco)

    // Initial parsing
    validateYaml(yamlData)

    // Add change listener to update parsed YAML
    editor.onDidChangeModelContent(() => {
      const currentValue = editor.getValue()
      validateYaml(currentValue)
    })

    // Set the custom theme
    monaco.editor.setTheme("yamlCustomTheme")
  }

  // Toggle section expansion in the tree view
  const toggleSectionExpansion = (section) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  // Navigate to a specific section in the editor
  const navigateToSection = (section, item) => {
    if (!editorRef.current) return

    const model = editorRef.current.getModel()
    if (!model) return

    const text = model.getValue()
    const lines = text.split("\n")

    let targetLine = 0
    let inSection = false
    let indentLevel = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for section header
      if (line.trim().startsWith(section + ":")) {
        inSection = true
        targetLine = i + 1
        indentLevel = line.indexOf(section)

        // If no specific item, just navigate to the section
        if (!item) break
      }

      // If in the right section, look for the item
      if (inSection && item && line.trim().startsWith(item + ":")) {
        targetLine = i + 1
        break
      }

      // If we've moved past the section (based on indentation), stop searching
      if (
        inSection &&
        !line.trim().startsWith("#") &&
        line.trim() !== "" &&
        line.indexOf(line.trim()[0]) <= indentLevel
      ) {
        inSection = false
      }
    }

    // Navigate to the line
    editorRef.current.revealLineInCenter(targetLine)
    editorRef.current.setPosition({ lineNumber: targetLine, column: 1 })
    editorRef.current.focus()

    setSelectedSection(section + (item ? "." + item : ""))

    // Expand the section in the tree view
    if (section) {
      setExpandedSections((prev) => new Set([...prev, section]))
    }
  }

  // Add a new item template to a section
  const addNewItem = useCallback(
    (type, name, parent) => {
      if (!editorRef.current || !monacoRef.current) return

      const model = editorRef.current.getModel()
      if (!model) return

      const text = model.getValue()
      const lines = text.split("\n")

      let insertLine = lines.length
      let indentLevel = 0

      if (parent) {
        // Find the parent section
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim().startsWith(parent + ":")) {
            insertLine = i + 1
            indentLevel = lines[i].indexOf(parent)
            break
          }
        }

        // Find the end of the parent section
        for (let i = insertLine; i < lines.length; i++) {
          if (
            !lines[i].trim().startsWith("#") &&
            lines[i].trim() !== "" &&
            lines[i].indexOf(lines[i].trim()[0]) <= indentLevel
          ) {
            insertLine = i
            break
          }
          insertLine = i + 1
        }
      }

      // Prepare the new content
      let newContent = TEMPLATES[type] || ""
      newContent = newContent.replace("{name}", name)

      // Insert the new content
      const position = { lineNumber: insertLine, column: 1 }
      editorRef.current.executeEdits("", [
        {
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
          text: newContent + "\n",
        },
      ])

      // Highlight the new addition
      const endLine = position.lineNumber + newContent.split("\n").length
      const decorations = editorRef.current.deltaDecorations(
        [],
        [
          {
            range: new monacoRef.current.Range(position.lineNumber, 1, endLine, 1),
            options: { inlineClassName: "newAddition" },
          },
        ],
      )

      // Remove the highlight after 3 seconds
      setTimeout(() => {
        editorRef.current.deltaDecorations(decorations, [])
      }, 3000)

      // Navigate to the newly added template
      editorRef.current.revealLineInCenter(position.lineNumber)
      editorRef.current.setPosition(position)
      editorRef.current.focus()

      setIsAddingNewItem(false)
      setNewItemName("")
      setNewItemType(null)
      setNewItemParent(null)

      // Revalidate YAML after adding new content
      setTimeout(() => {
        validateYaml(editorRef.current.getValue())
      }, 100)
    },
    [validateYaml],
  )

  // Add a new key-value pair
  const addKeyValuePair = useCallback(
    (parent, key, value) => {
      if (!editorRef.current || !monacoRef.current) return

      const model = editorRef.current.getModel()
      if (!model) return

      const text = model.getValue()
      const lines = text.split("\n")

      let insertLine = lines.length
      let indentLevel = 0

      // Find the parent section
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith(parent + ":")) {
          insertLine = i + 1
          indentLevel = lines[i].indexOf(parent)
          break
        }
      }

      // Find the end of the parent section
      for (let i = insertLine; i < lines.length; i++) {
        if (
          !lines[i].trim().startsWith("#") &&
          lines[i].trim() !== "" &&
          lines[i].indexOf(lines[i].trim()[0]) <= indentLevel
        ) {
          insertLine = i
          break
        }
        insertLine = i + 1
      }

      // Prepare the new content
      const newContent = KEY_VALUE_TEMPLATE.replace("{key}", key).replace("{value}", value)

      // Insert the new content
      const position = { lineNumber: insertLine, column: 1 }
      editorRef.current.executeEdits("", [
        {
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
          text: newContent + "\n",
        },
      ])

      // Highlight the new addition
      const decorations = editorRef.current.deltaDecorations(
        [],
        [
          {
            range: new monacoRef.current.Range(position.lineNumber, 1, position.lineNumber + 1, 1),
            options: { inlineClassName: "newAddition" },
          },
        ],
      )

      // Remove the highlight after 3 seconds
      setTimeout(() => {
        editorRef.current.deltaDecorations(decorations, [])
      }, 3000)

      // Navigate to the newly added key-value pair
      editorRef.current.revealLineInCenter(position.lineNumber)
      editorRef.current.setPosition(position)
      editorRef.current.focus()

      setNewKeyValuePair({ key: "", value: "" })

      // Revalidate YAML after adding new content
      setTimeout(() => {
        validateYaml(editorRef.current.getValue())
      }, 100)
    },
    [validateYaml],
  )

  // Get icon for a specific node based on its level and type
  const getNodeIcon = (nodeName, level) => {
    // First check if we have a specific icon for this node name
    if (SECTION_ICONS[nodeName]) {
      const IconComponent = SECTION_ICONS[nodeName]
      return <IconComponent className="h-4 w-4" />
    }

    // Otherwise use level-based icons
    const LevelIcon = LEVEL_ICONS[level] || File
    return <LevelIcon className="h-4 w-4" />
  }

  // Recursively render the YAML tree
  const renderYamlTree = (data, path = "", level = 0) => {
    if (!data || typeof data !== "object") return null

    return Object.entries(data).map(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key
      const isExpanded = expandedSections.has(currentPath)
      const isActive = selectedSection === currentPath

      // Handle array values
      if (Array.isArray(value)) {
        return (
          <SidebarGroup key={currentPath}>
            <SidebarGroupLabel
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                navigateToSection(currentPath)
                toggleSectionExpansion(currentPath)
              }}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              {getNodeIcon(key, level)}
              <span className={cn("capitalize", isActive && "font-medium")}>{key}</span>
            </SidebarGroupLabel>
            {isExpanded && (
              <SidebarGroupContent>
                <SidebarMenu>
                  {value.map((item, index) => (
                    <SidebarMenuItem key={`${currentPath}-${index}`}>
                      <SidebarMenuButton
                        className="flex items-center gap-2 pl-8"
                        onClick={() => navigateToSection(`${currentPath}[${index}]`)}
                        isActive={selectedSection === `${currentPath}[${index}]`}
                      >
                        {getNodeIcon("item", level + 1)}
                        <span>{typeof item === "string" ? item : `Item ${index + 1}`}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        )
      }

      // Handle object values
      if (typeof value === "object" && value !== null) {
        return (
          <SidebarGroup key={currentPath}>
            <SidebarGroupLabel
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                navigateToSection(key)
                toggleSectionExpansion(currentPath)
              }}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              {getNodeIcon(key, level)}
              <span className={cn("capitalize", isActive && "font-medium")}>{key}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto"
                      onClick={(e) => {
                        e.stopPropagation()
                        setNewItemType(key === "departments" ? "department" : "key-value")
                        setNewItemParent(currentPath)
                        setIsAddingNewItem(true)
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add new item</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SidebarGroupLabel>
            {isExpanded && (
              <SidebarGroupContent>
                <SidebarMenu>{renderYamlTree(value, currentPath, level + 1)}</SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        )
      }

      // Handle primitive values (strings, numbers, etc.)
      return (
        <SidebarMenuItem key={currentPath}>
          <SidebarMenuButton
            className={`flex items-center gap-2 ${level > 0 ? "pl-" + (level * 4) : ""}`}
            onClick={() => navigateToSection(currentPath)}
            isActive={selectedSection === currentPath}
          >
            {getNodeIcon(key, level)}
            <span className="capitalize">{key}:</span>
            <span className="text-muted-foreground truncate">{String(value)}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )
    })
  }

  // Initialize expanded sections
  useEffect(() => {
    // Expand top-level sections by default
    if (parsedYaml && Object.keys(parsedYaml).length > 0) {
      const topLevelSections = new Set(Object.keys(parsedYaml))
      setExpandedSections(topLevelSections)
    }
  }, [parsedYaml])

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar className="w-72 border-r">
          <SidebarHeader className="border-b p-4">
            <h2 className="text-lg font-semibold">YAML Structure</h2>
          </SidebarHeader>
          <SidebarContent className="overflow-auto">{renderYamlTree(parsedYaml)}</SidebarContent>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1">
          <div className="flex items-center h-14 px-4 border-b">
            <SidebarTrigger />
            <h2 className="ml-2 text-lg font-medium">YAML Editor</h2>
            <div className="ml-auto flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (editorRef.current) {
                          editorRef.current.getAction("editor.action.formatDocument").run()
                        }
                      }}
                    >
                      Format
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Format YAML document</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (editorRef.current) {
                          validateYaml(editorRef.current.getValue())
                        }
                      }}
                    >
                      Validate
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Validate YAML syntax</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex-1 relative">
            {parseError && (
              <Alert variant="destructive" className="absolute top-2 right-2 z-10 max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{parseError}</AlertDescription>
              </Alert>
            )}

            <Editor
              height="calc(100vh - 56px)"
              defaultLanguage="yaml"
              defaultValue={yamlData}
              theme="yamlCustomTheme"
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: true },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                wrappingIndent: "deepIndent",
                formatOnPaste: true,
                formatOnType: true,
                autoIndent: "full",
                folding: true,
                foldingStrategy: "indentation",
                renderIndentGuides: true,
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
                bracketPairColorization: {
                  enabled: true,
                },
                guides: {
                  bracketPairs: true,
                  indentation: true,
                },
                glyphMargin: true, // For error indicators
              }}
            />
          </div>
        </SidebarInset>
      </div>

      <Dialog open={isAddingNewItem} onOpenChange={setIsAddingNewItem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {newItemType === "key-value" ? "Key-Value Pair" : newItemType}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {newItemType === "key-value" ? (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="key" className="text-right">
                    Key
                  </Label>
                  <Input
                    id="key"
                    value={newKeyValuePair.key}
                    onChange={(e) => setNewKeyValuePair((prev) => ({ ...prev, key: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="value" className="text-right">
                    Value
                  </Label>
                  <Input
                    id="value"
                    value={newKeyValuePair.value}
                    onChange={(e) => setNewKeyValuePair((prev) => ({ ...prev, value: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
              </>
            ) : (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="col-span-3"
                />
              </div>
            )}
          </div>
          <Button
            onClick={() => {
              if (newItemType === "key-value") {
                addKeyValuePair(newItemParent, newKeyValuePair.key, newKeyValuePair.value)
              } else {
                addNewItem(newItemType, newItemName, newItemParent)
              }
            }}
          >
            Add to YAML
          </Button>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

