"use client"

import { useMemo } from "react"

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
  FileCode,
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
  Copy,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// First, import the necessary components
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

// Sample YAML data
const yamlData = `
table_info:
- table: dm_rtl_stock_movement
  joins: []
columns:
  item:
    name: Item
    type: varchar
    column: item
    desc: Item
    primary_key: false
  location_id:
    name: Location ID
    type: varchar
    column: location_id
    desc: Location ID
    primary_key: false
  date:
    name: Date
    type: date
    column: date
    desc: Date
    primary_key: false
  item_description:
    name: Item Description
    type: varchar
    column: item_description
    desc: Item Description
    primary_key: false
  subclass_id:
    name: Subclass ID
    type: varchar
    column: subclass_id
    desc: Subclass ID
    primary_key: false
  subclass_description:
    name: Subclass Description
    type: varchar
    column: subclass_description
    desc: Subclass Description
    primary_key: false
  class_id:
    name: Class ID
    type: varchar
    column: class_id
    desc: Class ID
    primary_key: false
  class_description:
    name: Class Description
    type: varchar
    column: class_description
    desc: Class Description
    primary_key: false
  department_id:
    name: Department ID
    type: varchar
    column: department_id
    desc: Department ID
    primary_key: false
  department_description:
    name: Department Description
    type: varchar
    column: department_description
    desc: Department Description
    primary_key: false
  group_id:
    name: Group ID
    type: varchar
    column: group_id
    desc: Group ID
    primary_key: false
  group_description:
    name: Group Description
    type: varchar
    column: group_description
    desc: Group Description
    primary_key: false
  division_id:
    name: Division ID
    type: varchar
    column: division_id
    desc: Division ID
    primary_key: false
  division_description:
    name: Division Description
    type: varchar
    column: division_description
    desc: Division Description
    primary_key: false
  location_description:
    name: Location Description
    type: varchar
    column: location_description
    desc: Location Description
    primary_key: false
  district_id:
    name: District ID
    type: varchar
    column: district_id
    desc: District ID
    primary_key: false
  district_description:
    name: District Description
    type: varchar
    column: district_description
    desc: District Description
    primary_key: false
  region_id:
    name: Region ID
    type: varchar
    column: region_id
    desc: Region ID
    primary_key: false
  region_description:
    name: Region Description
    type: varchar
    column: region_description
    desc: Region Description
    primary_key: false
  geozone_id:
    name: Geozone ID
    type: varchar
    column: geozone_id
    desc: Geozone ID
    primary_key: false
  geozone_description:
    name: Geozone Description
    type: varchar
    column: geozone_description
    desc: Geozone Description
    primary_key: false
  area_id:
    name: Area ID
    type: varchar
    column: area_id
    desc: Area ID
    primary_key: false
  area_description:
    name: Area Description
    type: varchar
    column: area_description
    desc: Area Description
    primary_key: false
  chain_id:
    name: Chain ID
    type: varchar
    column: chain_id
    desc: Chain ID
    primary_key: false
  chain_description:
    name: Chain Description
    type: varchar
    column: chain_description
    desc: Chain Description
    primary_key: false
  channel_id:
    name: Channel ID
    type: varchar
    column: channel_id
    desc: Channel ID
    primary_key: false
  channel_description:
    name: Channel Description
    type: varchar
    column: channel_description
    desc: Channel Description
    primary_key: false
  banner_id:
    name: Banner ID
    type: varchar
    column: banner_id
    desc: Banner ID
    primary_key: false
  banner_description:
    name: Banner Description
    type: varchar
    column: banner_description
    desc: Banner Description
    primary_key: false
  inv_type:
    name: Inventory Type
    type: varchar(1)
    column: inv_type
    desc: Inventory Type
    primary_key: false
  sales_quantity:
    name: Sales Quantity
    type: number
    column: sales_quantity
    desc: Sales Quantity
  sales_cost:
    name: Sales Cost
    type: number
    column: sales_cost
    desc: Sales Cost
  sales_amount:
    name: Sales Amount
    type: number
    column: sales_amount
    desc: Sales Amount
  regular_sales_quantity:
    name: Regular Sales Quantity
    type: number
    column: regular_sales_quantity
    desc: Regular Sales Quantity
  regular_sales_cost:
    name: Regular Sales Cost
    type: number
    column: regular_sales_cost
    desc: Regular Sales Cost
  regular_sales_amount:
    name: Regular Sales Amount
    type: number
    column: regular_sales_amount
    desc: Regular Sales Amount
  promotional_sales_quantity:
    name: Promotional Sales Quantity
    type: number
    column: promotional_sales_quantity
    desc: Promotional Sales Quantity
  promotional_sales_cost:
    name: Promotional Sales Cost
    type: number
    column: promotional_sales_cost
    desc: Promotional Sales Cost
  promotional_sales_amount:
    name: Promotional Sales Amount
    type: number
    column: promotional_sales_amount
    desc: Promotional Sales Amount
  clearance_sales_quantity:
    name: Clearance Sales Quantity
    type: number
    column: clearance_sales_quantity
    desc: Clearance Sales Quantity
  clearance_sales_cost:
    name: Clearance Sales Cost
    type: number
    column: clearance_sales_cost
    desc: Clearance Sales Cost
  clearance_sales_amount:
    name: Clearance Sales Amount
    type: number
    column: clearance_sales_amount
    desc: Clearance Sales Amount
  return_sales_quantity:
    name: Return Sales Quantity
    type: number
    column: return_sales_quantity
    desc: Return Sales Quantity
  return_sales_cost:
    name: Return Sales Cost
    type: number
    column: return_sales_cost
    desc: Return Sales Cost
  return_sales_amount:
    name: Return Sales Amount
    type: number
    column: return_sales_amount
    desc: Return Sales Amount
  total_discount_amount:
    name: Total Discount Amount
    type: number
    column: total_discount_amount
    desc: Total Discount Amount
  employee_discount_amount:
    name: Employee Discount Amount
    type: number
    column: employee_discount_amount
    desc: Employee Discount Amount
  vat_amt:
    name: VAT Amount
    type: number
    column: vat_amt
    desc: VAT Amount
  inventory_onhand_quantity:
    name: Inventory Onhand Quantity
    type: number
    column: inventory_onhand_quantity
    desc: Inventory Onhand Quantity
  inventory_onhand_retail_amount:
    name: Inventory Onhand Retail Amount
    type: number
    column: inventory_onhand_retail_amount
    desc: Inventory Onhand Retail Amount
  inventory_onhand_cost_amount:
    name: Inventory Onhand Cost Amount
    type: number
    column: inventory_onhand_cost_amount
    desc: Inventory Onhand Cost Amount
  inventory_intransit_quantity:
    name: Inventory Intransit Quantity
    type: number
    column: inventory_intransit_quantity
    desc: Inventory Intransit Quantity
  inventory_onorder_quantity:
    name: Inventory Onorder Quantity
    type: number
    column: inventory_onorder_quantity
    desc: Inventory Onorder Quantity
  inventory_markup_quantity:
    name: Inventory Markup Quantity
    type: number
    column: inventory_markup_quantity
    desc: Inventory Markup Quantity
  inventory_markup_amount:
    name: Inventory Markup Amount
    type: number
    column: inventory_markup_amount
    desc: Inventory Markup Amount
  inventory_markup_cancel_quantity:
    name: Inventory Markup Cancel Quantity
    type: number
    column: inventory_markup_cancel_quantity
    desc: Inventory Markup Cancel Quantity
  inventory_markup_cancel_amount:
    name: Inventory Markup Cancel Amount
    type: number
    column: inventory_markup_cancel_amount
    desc: Inventory Markup Cancel Amount
  inventory_markdown_quantity:
    name: Inventory Markdown Quantity
    type: number
    column: inventory_markdown_quantity
    desc: Inventory Markdown Quantity
  inventory_markdown_amount:
    name: Inventory Markdown Amount
    type: number
    column: inventory_markdown_amount
    desc: Inventory Markdown Amount
  inventory_markdown_cancel_quantity:
    name: Inventory Markdown Cancel Quantity
    type: number
    column: inventory_markdown_cancel_quantity
    desc: Inventory Markdown Cancel Quantity
  inventory_markdown_cancel_amount:
    name: Inventory Markdown Cancel Amount
    type: number
    column: inventory_markdown_cancel_amount
    desc: Inventory Markdown Cancel Amount
  inventory_adjustment_quantity:
    name: Inventory Adjustment Quantity
    type: number
    column: inventory_adjustment_quantity
    desc: Inventory Adjustment Quantity
  inventory_adjustment_cost_amount:
    name: Inventory Adjustment Cost Amount
    type: number
    column: inventory_adjustment_cost_amount
    desc: Inventory Adjustment Cost Amount
  inventory_adjustment_retail_amount:
    name: Inventory Adjustment Retail Amount
    type: number
    column: inventory_adjustment_retail_amount
    desc: Inventory Adjustment Retail Amount
  inventory_receipt_quantity:
    name: Inventory Receipt Quantity
    type: number
    column: inventory_receipt_quantity
    desc: Inventory Receipt Quantity
  inventory_receipt_cost_amount:
    name: Inventory Receipt Cost Amount
    type: number
    column: inventory_receipt_cost_amount
    desc: Inventory Receipt Cost Amount
  inventory_receipt_retail_amount:
    name: Inventory Receipt Retail Amount
    type: number
    column: inventory_receipt_retail_amount
    desc: Inventory Receipt Retail Amount
  inventory_intransit_retail_amount:
    name: Inventory Intransit Retail Amount
    type: number
    column: inventory_intransit_retail_amount
    desc: Inventory Intransit Retail Amount
  inventory_intransit_cost_amount:
    name: Inventory Intransit Cost Amount
    type: number
    column: inventory_intransit_cost_amount
    desc: Inventory Intransit Cost Amount
  inventory_onorder_retail_amount:
    name: Inventory Onorder Retail Amount
    type: number
    column: inventory_onorder_retail_amount
    desc: Inventory Onorder Retail Amount
  inventory_onorder_cost_amount:
    name: Inventory Onorder Cost Amount
    type: number
    column: inventory_onorder_cost_amount
    desc: Inventory Onorder Cost Amount
  inventory_rtv_quantity:
    name: Inventory RTV Quantity
    type: number
    column: inventory_rtv_quantity
    desc: Inventory RTV Quantity
  inventory_rtv_cost_amount:
    name: Inventory RTV Cost Amount
    type: number
    column: inventory_rtv_cost_amount
    desc: Inventory RTV Cost Amount
  inventory_rtv_retail_amount:
    name: Inventory RTV Retail Amount
    type: number
    column: inventory_rtv_retail_amount
    desc: Inventory RTV Retail Amount
  inventory_transfer_reserved_quantity:
    name: Inventory Transfer Reserved Quantity
    type: number
    column: inventroy_transfer_reserved_quantity
    desc: Inventory Transfer Reserved Quantity
  inventory_customer_reserved_quantity:
    name: Inventory Customer Reserved Quantity
    type: number
    column: inventory_customer_reserved_quantity
    desc: Inventory Customer Reserved Quantity
  inventory_non_sellable_quantity:
    name: Inventory Non Sellable Quantity
    type: number
    column: inventory_non_sellable_quantity
    desc: Inventory Non Sellable Quantity
  inventory_transfer_in_quantity:
    name: Inventory Transfer In Quantity
    type: number
    column: inventory_transfer_in_quantity
    desc: Inventory Transfer In Quantity
  inventory_transfer_in_cost_amount:
    name: Inventory Transfer In Cost Amount
    type: number
    column: inventory_transfer_in_cost_amount
    desc: Inventory Transfer In Cost Amount
  inventory_transfer_in_retail_amount:
    name: Inventory Transfer In Retail Amount
    type: number
    column: inventory_transfer_in_retail_amount
    desc: Inventory Transfer In Retail Amount
  inventory_transfer_out_quantity:
    name: Inventory Transfer Out Quantity
    type: number
    column: inventory_transfer_out_quantity
    desc: Inventory Transfer Out Quantity
  inventory_transfer_out_cost_amount:
    name: Inventory Transfer Out Cost Amount
    type: number
    column: inventory_transfer_out_cost_amount
    desc: Inventory Transfer Out Cost Amount
  inventory_transfer_out_retail_amount:
    name: Inventory Transfer Out Retail Amount
    type: number
    column: inventory_transfer_out_retail_amount
    desc: Inventory Transfer Out Retail Amount
  inventory_boh_quantity:
    name: Inventory BOH Quantity
    type: number
    column: inventory_boh_quantity
    desc: Inventory BOH Quantity
  inventory_boh_cost_amount:
    name: Inventory BOH Cost Amount
    type: number
    column: inventory_boh_cost_amount
    desc: Inventory BOH Cost Amount
  inventory_boh_retail_amount:
    name: Inventory BOH Retail Amount
    type: number
    column: inventory_boh_retail_amount
    desc: Inventory BOH Retail Amount
`

// Replace the dynamic icon selection with fixed icons
// Section icons mapping with fixed icons
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
  // Add default icons for any other key
  default: FileText,
  array: Layers,
  object: Folder,
  primitive: File,
}

// Level-based icons for tree hierarchy
const LEVEL_ICONS = {
  0: Folder, // Root level
  1: FolderOpen, // First level
  2: Database, // Second level
  3: FileText, // Third level
  default: File, // Default for any other level
}

// Templates for different types of level 1 items
const TEMPLATES = {
  department: `{name}:
      team_lead: Team Lead Name
      key_focus: Focus Area`,
  technology: `- {name}`,
  strategy: `- {name}`,
  region: `- {name}`,
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
  const [activeDecorations, setActiveDecorations] = useState([])
  const [lastClickedSection, setLastClickedSection] = useState(null)
  const [isEditorReady, setIsEditorReady] = useState(false) // Add loading state
  const [editorLineMap, setEditorLineMap] = useState({}) // Map line numbers to YAML paths

  // Enhanced YAML validation function
  const validateYaml = useCallback((yamlString) => {
    try {
      const parsed = parse(yamlString)
      setParsedYaml(parsed)
      setParseError(null)

      // After successful parsing, build the line map
      buildEditorLineMap(yamlString, parsed)

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

  // Build a map of line numbers to YAML paths
  const buildEditorLineMap = useCallback((yamlString, parsedYaml) => {
    const lines = yamlString.split("\n")
    const lineMap = {}

    // Helper function to recursively build the map
    const buildMap = (obj, path = "", lineStart = 0) => {
      if (!obj || typeof obj !== "object") return lineStart

      let currentLine = lineStart

      // Skip empty lines and comments
      while (
        currentLine < lines.length &&
        (lines[currentLine].trim() === "" || lines[currentLine].trim().startsWith("#"))
      ) {
        currentLine++
      }

      // Process each key in the object
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key

        // Find the line that contains this key
        let keyLine = -1
        for (let i = currentLine; i < lines.length; i++) {
          const line = lines[i].trim()
          if (line === "" || line.startsWith("#")) continue

          // Check if this line contains the key
          if (line.startsWith(`${key}:`)) {
            keyLine = i
            break
          }
        }

        if (keyLine !== -1) {
          // Store the mapping
          lineMap[keyLine + 1] = currentPath // +1 because editor lines are 1-indexed

          // If the value is an object or array, recursively process it
          if (typeof value === "object" && value !== null) {
            if (Array.isArray(value)) {
              // For arrays, find each item's line
              let arrayLine = keyLine + 1
              for (let i = 0; i < value.length; i++) {
                // Find the line with the array item
                while (arrayLine < lines.length) {
                  const line = lines[arrayLine].trim()
                  if (line === "" || line.startsWith("#")) {
                    arrayLine++
                    continue
                  }

                  if (line.startsWith("-")) {
                    lineMap[arrayLine + 1] = `${currentPath}[${i}]`

                    // If the array item is an object, recursively process it
                    if (typeof value[i] === "object" && value[i] !== null) {
                      arrayLine = buildMap(value[i], `${currentPath}[${i}]`, arrayLine + 1)
                    } else {
                      arrayLine++
                    }
                    break
                  }

                  arrayLine++
                }
              }
            } else {
              // For objects, recursively process
              buildMap(value, currentPath, keyLine + 1)
            }
          }
        }
      }

      return currentLine
    }

    buildMap(parsedYaml)
    setEditorLineMap(lineMap)
  }, [])

  // Format YAML document
  const formatYamlDocument = useCallback(() => {
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

      // Validate the formatted YAML
      validateYaml(formatted)
    } catch (error) {
      console.error("Error formatting YAML:", error)
      setParseError(`Error formatting YAML: ${error.message}`)
    }
  }, [validateYaml])

  // Copy YAML to clipboard
  const copyToClipboard = useCallback(() => {
    if (!editorRef.current) return

    const content = editorRef.current.getValue()
    navigator.clipboard
      .writeText(content)
      .then(() => {
        // Show a temporary success message
        const tempAlert = document.createElement("div")
        tempAlert.className = "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50"
        tempAlert.textContent = "YAML copied to clipboard!"
        document.body.appendChild(tempAlert)

        setTimeout(() => {
          document.body.removeChild(tempAlert)
        }, 2000)
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
        setParseError("Failed to copy to clipboard")
      })
  }, [])

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

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 0)
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
      .yaml-section-highlight {
        background-color: rgba(100, 100, 255, 0.2);
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

    // Set editor ready
    setIsEditorReady(true)
  }

  // Toggle section expansion in the tree view
  const toggleSectionExpansion = useCallback((section) => {
    setExpandedSections((prev) => {
      const newSet = new Set([...prev])
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }, [])

  // Find the line number and range for a specific section in the YAML
  const findSectionRange = useCallback((section, item) => {
    if (!editorRef.current) return null

    const model = editorRef.current.getModel()
    if (!model) return null

    const text = model.getValue()
    const lines = text.split("\n")

    // Handle array item notation like "technologies[0]"
    const arrayMatch = section && section.match(/(.+)\[(\d+)\]$/)
    if (arrayMatch) {
      const arraySection = arrayMatch[1]
      const arrayIndex = Number.parseInt(arrayMatch[2])

      // Build the full path to find the exact location
      const fullPath = arraySection.split(".")
      let currentLevel = 0
      let currentIndent = -1
      let inTargetSection = false
      let itemCount = 0

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line === "" || line.startsWith("#")) continue

        const indent = lines[i].search(/\S/)

        // Reset tracking when we move to a sibling or parent of our path
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

        // Check if we're at the right path level
        if (line.startsWith(fullPath[currentLevel] + ":")) {
          currentIndent = indent
          currentLevel++

          // If we've reached the full path to the array
          if (currentLevel === fullPath.length) {
            inTargetSection = true
            itemCount = 0
            continue
          }
        }

        // If we're in the target array section, count items until we reach our index
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

    // Handle nested property access like "company.name"
    if (item) {
      const fullPath = section + "." + item
      const pathSegments = fullPath.split(".")

      let currentLevel = 0
      let currentIndent = -1

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line === "" || line.startsWith("#")) continue

        const indent = lines[i].search(/\S/)

        // Reset tracking when we move to a sibling or parent of our path
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

        // Check if we're at the right path level
        if (line.startsWith(pathSegments[currentLevel] + ":")) {
          currentIndent = indent
          currentLevel++

          // If we've reached the full path to the property
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

    // Handle regular sections by following the full path
    const pathSegments = section ? section.split(".") : []
    let currentLevel = 0
    let currentIndent = -1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line === "" || line.startsWith("#")) continue

      const indent = lines[i].search(/\S/)

      // Reset tracking when we move to a sibling or parent of our path
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

      // Check if we're at the right path level
      if (pathSegments.length > 0 && line.startsWith(pathSegments[currentLevel] + ":")) {
        currentIndent = indent
        currentLevel++

        // If we've reached the full path
        if (currentLevel === pathSegments.length) {
          // Find the end of this section
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
  }, [])

  // Navigate to a specific section in the editor
  const navigateToSection = useCallback(
    (section, item) => {
      if (!editorRef.current || !monacoRef.current) return

      // Store the last clicked section for reference
      setLastClickedSection({ section, item })

      const range = findSectionRange(section, item)
      if (!range) return

      // Clear previous decorations
      if (activeDecorations.length > 0) {
        editorRef.current.deltaDecorations(activeDecorations, [])
      }

      // Highlight the section
      const decorations = editorRef.current.deltaDecorations(
        [],
        [
          {
            range: new monacoRef.current.Range(range.startLine, 1, range.endLine, 1),
            options: {
              className: "yaml-section-highlight",
              isWholeLine: true,
            },
          },
        ],
      )

      // Store decorations for later removal
      setActiveDecorations(decorations)

      // Navigate to the line and position cursor
      editorRef.current.revealLineInCenter(range.lineNumber)

      // Get the line content and find the position of the key
      const model = editorRef.current.getModel()
      const lineContent = model.getLineContent(range.lineNumber)

      // For leaf nodes (items), position at the value
      if (item) {
        const keyPosition = lineContent.indexOf(item + ":")
        const valuePosition = lineContent.indexOf(":", keyPosition) + 1
        editorRef.current.setPosition({
          lineNumber: range.lineNumber,
          column: valuePosition + 1,
        })
      } else {
        // For section nodes, position at the key
        const keyMatch = section.split(".").pop()
        const keyPosition = lineContent.indexOf(keyMatch)
        editorRef.current.setPosition({
          lineNumber: range.lineNumber,
          column: keyPosition + 1,
        })
      }

      editorRef.current.focus()

      // Update selected section
      setSelectedSection(section + (item ? "." + item : ""))

      // Expand the section in the tree view
      if (section) {
        const parts = section.split(".")
        let currentPath = ""

        // Expand all parent sections
        for (const part of parts) {
          currentPath = currentPath ? `${currentPath}.${part}` : part
          setExpandedSections((prev) => new Set([...prev, currentPath]))
        }
      }
    },
    [findSectionRange, activeDecorations],
  )

  // Completely rewritten findInsertionPoint function
  const findInsertionPoint = useCallback((parent) => {
    if (!editorRef.current) return null

    const model = editorRef.current.getModel()
    if (!model) return null

    const text = model.getValue()
    const lines = text.split("\n")

    // Helper function to get indentation level
    const getIndentLevel = (line) => {
      const match = line.match(/^(\s*)/)
      return match ? match[1].length : 0
    }

    // Helper function to check if a line is an array item
    const isArrayItem = (line) => {
      return line.trim().startsWith("-")
    }

    // Parse the parent path
    const pathSegments = parent.split(".")

    // Special handling for array items
    const isArrayParent = pathSegments[pathSegments.length - 1].match(/(.+)\[(\d+)\]$/)
    if (isArrayParent) {
      // If parent is an array item, we need to find the array itself
      pathSegments[pathSegments.length - 1] = isArrayParent[1]
    }

    // Find the exact parent section
    let parentLineNumber = -1
    let parentIndent = -1
    const currentPath = []
    let inArrayContext = false
    let contextType = "unknown"

    // First pass: find the parent section
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line === "" || line.startsWith("#")) continue

      const indent = getIndentLevel(lines[i])

      // If we're at a lower or equal indentation level than our current path,
      // we need to pop from our path until we're at the right level
      while (currentPath.length > 0 && indent <= parentIndent) {
        currentPath.pop()
        parentIndent = currentPath.length > 0 ? getIndentLevel(lines[currentPath[currentPath.length - 1]]) : -1
      }

      // Check if this line contains a key that matches our current path segment
      const keyMatch = line.match(/^([^:]+):/)
      if (keyMatch) {
        const key = keyMatch[1].trim()
        const expectedKey = pathSegments[currentPath.length]

        if (key === expectedKey) {
          currentPath.push(i)
          parentIndent = indent

          // If we've found the full path, we're done with the first pass
          if (currentPath.length === pathSegments.length) {
            parentLineNumber = i

            // Determine the context type
            const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : ""
            if (nextLine.startsWith("-")) {
              contextType = "array"
              inArrayContext = true
            } else if (nextLine.includes(":") && !nextLine.endsWith(":")) {
              contextType = "key-value"
            } else if (nextLine.endsWith(":")) {
              contextType = "object"
            }

            break
          }
        }
      } else if (isArrayItem(line)) {
        // Check if we're in an array context
        if (currentPath.length > 0 && currentPath.length === pathSegments.length - 1) {
          // We're in an array context
          inArrayContext = true
          contextType = "array"

          // If this is the specific array item we're looking for
          if (isArrayParent) {
            const arrayIndex = Number.parseInt(isArrayParent[2])
            let itemCount = 0

            // Count array items to find our target
            for (let j = currentPath[currentPath.length - 1] + 1; j <= i; j++) {
              const itemLine = lines[j].trim()
              if (itemLine.startsWith("-")) {
                if (itemCount === arrayIndex) {
                  parentLineNumber = j
                  break
                }
                itemCount++
              }
            }

            if (parentLineNumber !== -1) {
              break
            }
          }
        }
      }
    }

    if (parentLineNumber === -1) return null

    // Second pass: find the insertion point
    let insertLine = parentLineNumber + 1
    let childIndent = -1
    let foundFirstChild = false
    let lastChildLine = parentLineNumber

    // Find the appropriate insertion point within the parent section
    for (let i = parentLineNumber + 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line === "" || line.startsWith("#")) continue

      const indent = getIndentLevel(lines[i])

      // If we find a line with less or equal indentation than the parent,
      // we've reached the end of the parent section
      if (indent <= parentIndent) {
        insertLine = i
        break
      }

      // Track if we've found any children
      if (!foundFirstChild) {
        foundFirstChild = true
        childIndent = indent
      }

      // Update the last child line
      lastChildLine = i
      insertLine = i + 1

      // Check if we're in an array context
      if (isArrayItem(line) && indent === parentIndent + 2) {
        inArrayContext = true
        contextType = "array"
      }
    }

    // Calculate the proper indentation for the new item
    let properIndent

    if (foundFirstChild) {
      // If we found children, use their indentation
      properIndent = childIndent
    } else {
      // If no children, calculate based on parent's indentation
      properIndent = parentIndent + 2
    }

    return {
      lineNumber: insertLine,
      indentLevel: parentIndent,
      properIndent: properIndent,
      isArrayContext: inArrayContext,
      parentLineNumber: parentLineNumber,
      contextType: contextType,
    }
  }, [])

  // Add a new item template to a section
  const addNewItem = useCallback(
    (type, name, parent) => {
      if (!editorRef.current || !monacoRef.current) return

      const insertPoint = findInsertionPoint(parent)
      if (!insertPoint) return

      const { lineNumber, properIndent, isArrayContext, parentLineNumber, contextType } = insertPoint

      // Prepare the new content with proper indentation
      let newContent = ""

      // Determine the type of content to add based on context
      if (type === "key-value" && contextType !== "array") {
        // Simple key-value pair
        newContent = KEY_VALUE_TEMPLATE.replace("{key}", name).replace("{value}", "value")
      } else if (
        contextType === "array" ||
        type === "technology" ||
        type === "strategy" ||
        type === "region" ||
        isArrayContext
      ) {
        // Array item
        newContent = `- ${name}`
      } else if (type === "department") {
        // Department object
        newContent = TEMPLATES.department.replace("{name}", name)
      } else if (contextType === "object") {
        // Object with nested structure
        newContent = `${
          // Object with nested structure
          (newContent = `${name}:\n${" ".repeat(properIndent + 2)}key: value`)
          } else {
        // Default to template if available, otherwise key-value
        newContent = TEMPLATES[type] ? TEMPLATES[type].replace("{name}", name) : \`${name}: value`
      }

      // Add proper indentation to each line
      const indentation = " ".repeat(properIndent)
      newContent = newContent
        .split("\n")
        .map((line) => indentation + line)
        .join("\n")

      // Insert the new content
      const position = { lineNumber, column: 1 }
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
            options: { inlineClassName: "newAddition", isWholeLine: true },
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
    [findInsertionPoint, validateYaml],
  )

  // Add a new key-value pair
  const addKeyValuePair = useCallback(
    (parent, key, value) => {
      if (!editorRef.current || !monacoRef.current) return

      const insertPoint = findInsertionPoint(parent)
      if (!insertPoint) return

      const { lineNumber, properIndent } = insertPoint

      // Prepare the new content with proper indentation
      const indentation = " ".repeat(properIndent)
      const newContent = indentation + KEY_VALUE_TEMPLATE.replace("{key}", key).replace("{value}", value)

      // Insert the new content
      const position = { lineNumber, column: 1 }
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
            options: { inlineClassName: "newAddition", isWholeLine: true },
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
    [findInsertionPoint, validateYaml],
  )

  // Get icon for a specific node based on its level and type
  const getNodeIcon = useCallback((nodeName, level) => {
    // First check if we have a specific icon for this node name
    if (SECTION_ICONS[nodeName]) {
      const IconComponent = SECTION_ICONS[nodeName]
      return <IconComponent className="h-4 w-4" />
    }

    // Otherwise use level-based icons
    const LevelIcon = LEVEL_ICONS[level] || LEVEL_ICONS.default
    return <LevelIcon className="h-4 w-4" />
  }, [])

  // Recursively render the YAML tree
  const renderYamlTree = useCallback(
    (data, path = "", level = 0) => {
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
                className={`flex items-center gap-2 cursor-pointer p-2 my-0.5 transition-all hover:bg-accent/70 hover:text-accent-foreground ${isActive ? "bg-primary/15 text-primary font-medium" : ""}`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  navigateToSection(currentPath)
                  toggleSectionExpansion(currentPath)
                }}
                data-active={isActive}
              >
                <div
                  className="flex items-center cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSectionExpansion(currentPath)
                  }}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
                {getNodeIcon(key, level)}
                <span className={cn("capitalize", isActive && "font-medium")}>{key}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Determine the appropriate item type based on the context
                          const itemType = Array.isArray(value)
                            ? key === "technologies"
                              ? "technology"
                              : key === "strategies"
                                ? "strategy"
                                : key === "regions"
                                  ? "region"
                                  : "array-item"
                            : key === "departments"
                              ? "department"
                              : typeof value === "object"
                                ? "object"
                                : "key-value"

                          setNewItemType(itemType)
                          setNewItemParent(currentPath)
                          setIsAddingNewItem(true)
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
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
                  <SidebarMenu>
                    {value.map((item, index) => (
                      <SidebarMenuItem key={`${currentPath}-${index}`}>
                        <SidebarMenuButton
                          className={`flex items-center gap-2 pl-8 py-1.5 my-0.5 transition-all hover:bg-accent/70 hover:text-accent-foreground rounded-md`}
                          onClick={() => navigateToSection(`${currentPath}[${index}]`)}
                          isActive={selectedSection === `${currentPath}[${index}]`}
                        >
                          {getNodeIcon("item", level + 1)}
                          <span
                            className={`truncate ${selectedSection === `${currentPath}[${index}]` ? "text-primary font-medium" : "text-muted-foreground"}`}
                          >
                            {typeof item === "string" ? item : `Item ${index + 1}`}
                          </span>
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
                className={`flex items-center gap-2 cursor-pointer p-2 my-0.5 transition-all hover:bg-accent/70 hover:text-accent-foreground ${isActive ? "bg-primary/15 text-primary font-medium" : ""}`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  navigateToSection(currentPath)
                  toggleSectionExpansion(currentPath)
                }}
                data-active={isActive}
              >
                <div
                  className="flex items-center cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSectionExpansion(currentPath)
                  }}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
                {getNodeIcon(key, level)}
                <span className={cn("capitalize", isActive && "font-medium")}>{key}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          setNewItemType(key === "departments" ? "department" : "key-value")
                          setNewItemParent(currentPath)
                          setIsAddingNewItem(true)
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
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
              className={`flex items-center gap-2 ${level > 0 ? "pl-" + (level * 4) : ""} py-1.5 my-0.5 transition-all hover:bg-accent/70 hover:text-accent-foreground rounded-md`}
              onClick={() => navigateToSection(path, key)}
              isActive={selectedSection === `${path}.${key}`}
            >
              {getNodeIcon(key, level)}
              <span className={`capitalize ${selectedSection === `${path}.${key}` ? "font-medium text-primary" : ""}`}>
                {key}:
              </span>
              <span
                className={`truncate ${selectedSection === `${path}.${key}` ? "text-primary" : "text-muted-foreground"}`}
              >
                {String(value)}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })
    },
    [expandedSections, selectedSection, navigateToSection, toggleSectionExpansion, getNodeIcon],
  )

  // Get lines from editor
  const lines = useMemo(() => {
    if (!editorRef.current) return []
    const model = editorRef.current.getModel()
    if (!model) return []
    return model.getValue().split("\n")
  }, [])

  // Initialize expanded sections
  useEffect(() => {
    // Expand top-level sections by default only on initial load
    if (parsedYaml && Object.keys(parsedYaml).length > 0 && expandedSections.size === 0) {
      const topLevelSections = new Set(Object.keys(parsedYaml))
      setExpandedSections(topLevelSections)
    }
  }, [parsedYaml, expandedSections.size])

  // Preserve expanded sections when YAML changes
  useEffect(() => {
    if (!parsedYaml) return

    // Create a function to check if paths still exist in the updated YAML
    const pathExists = (path) => {
      const segments = path.split(".")
      let current = parsedYaml

      for (const segment of segments) {
        // Handle array notation like "technologies[0]"
        const arrayMatch = segment.match(/(.+)\[(\d+)\]$/)
        if (arrayMatch) {
          const arrayName = arrayMatch[1]
          const arrayIndex = Number.parseInt(arrayMatch[2], 10)

          if (!current[arrayName] || !Array.isArray(current[arrayName]) || arrayIndex >= current[arrayName].length) {
            return false
          }
          current = current[arrayName][arrayIndex]
        } else if (current[segment] === undefined) {
          return false
        } else {
          current = current[segment]
        }
      }
      return true
    }

    // Filter out expanded sections that no longer exist
    setExpandedSections((prev) => {
      const newSet = new Set()
      for (const path of prev) {
        if (pathExists(path)) {
          newSet.add(path)
        }
      }
      return newSet
    })
  }, [parsedYaml])

  // Add this useEffect to handle clicks outside the selected area
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Only handle clicks directly in the editor content area
      // Ignore clicks on buttons, sidebar, or other UI elements
      if (activeDecorations.length > 0 && editorRef.current) {
        const editorElement = editorRef.current.getDomNode()
        const sidebarElement = document.querySelector(".sidebar")
        const dialogElement = document.querySelector(".dialog")
        const buttonElements = Array.from(document.querySelectorAll("button"))

        // Skip if clicking on sidebar, dialog, or buttons
        if (
          (sidebarElement && sidebarElement.contains(e.target)) ||
          (dialogElement && dialogElement.contains(e.target)) ||
          buttonElements.some((button) => button.contains(e.target))
        ) {
          return
        }

        // Check if the click is inside the editor content area
        if (editorElement && editorElement.contains(e.target)) {
          // Only clear decorations, but don't close tree navigation
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

  // Enhanced function to find the exact path for a cursor position
  const findPathForPosition = useCallback(
    (position) => {
      if (!editorRef.current || !position) return null

      // First check if we have a direct mapping in our line map
      if (editorLineMap[position.lineNumber]) {
        return editorLineMap[position.lineNumber]
      }

      // If not in the map, try to find the closest line
      const lineNumbers = Object.keys(editorLineMap)
        .map(Number)
        .sort((a, b) => a - b)

      // Find the closest line before the current position
      let closestLine = -1
      for (const line of lineNumbers) {
        if (line <= position.lineNumber && line > closestLine) {
          closestLine = line
        }
      }

      if (closestLine !== -1) {
        return editorLineMap[closestLine]
      }

      // If we still can't find it, use the traditional method
      const model = editorRef.current.getModel()
      if (!model) return null

      const lineContent = model.getLineContent(position.lineNumber)
      if (!lineContent) return null

      // Try to find the key at this position
      const keyMatch = lineContent.match(/^\s*([^:]+):/)
      if (!keyMatch) {
        // Check if it's an array item
        const arrayItemMatch = lineContent.match(/^\s*-\s*(.*)/)
        if (arrayItemMatch) {
          // Find the array that contains this item
          const arrayItemValue = arrayItemMatch[1].trim()

          // Search through the entire YAML structure to find this array item
          const findArrayItemPath = (obj, targetValue, currentPath = "") => {
            if (!obj || typeof obj !== "object") return null

            for (const [k, v] of Object.entries(obj)) {
              const newPath = currentPath ? `${currentPath}.${k}` : k

              if (Array.isArray(v)) {
                for (let i = 0; i < v.length; i++) {
                  if (String(v[i]) === targetValue) {
                    return `${newPath}[${i}]`
                  }

                  // If array item is an object, search within it
                  if (typeof v[i] === "object" && v[i] !== null) {
                    const result = findArrayItemPath(v[i], targetValue, `${newPath}[${i}]`)
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

      // Find the path to this key by traversing up the YAML structure
      const findPathToKey = (obj, targetKey, currentPath = "", context = null) => {
        if (!obj || typeof obj !== "object") return null

        // Get the indentation level of the current line
        const currentIndent = lineContent.search(/\S/)

        for (const [k, v] of Object.entries(obj)) {
          const newPath = currentPath ? `${currentPath}.${k}` : k

          if (k === targetKey) {
            // If we have context (like line number and indentation),
            // make sure this is the right occurrence of the key
            if (context) {
              const range = findSectionRange(newPath)
              if (range && Math.abs(range.lineNumber - position.lineNumber) <= 1) {
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
                  const result = findPathToKey(v[i], targetKey, `${newPath}[${i}]`, context)
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

      // Try to find the path with context
      const contextPath = findPathToKey(parsedYaml, key, "", {
        lineNumber: position.lineNumber,
        indent: lineContent.search(/\S/),
      })
      if (contextPath) return contextPath

      // If we couldn't find it with context, try without
      return findPathToKey(parsedYaml, key)
    },
    [editorLineMap, parsedYaml, findSectionRange],
  )

  // Enhanced function to highlight the tree when a section is selected in the editor
  const highlightTreeForEditorSelection = useCallback(
    (position) => {
      if (!editorRef.current || !position) return

      const path = findPathForPosition(position)
      if (!path) return

      // Expand all parent sections
      const parts = path.split(".")
      let currentPath = ""

      // Make sure all parent sections are expanded
      for (const part of parts) {
        if (part.includes("[")) {
          // Handle array notation
          const arrayPart = part.split("[")[0]
          currentPath = currentPath ? `${currentPath}.${arrayPart}` : arrayPart
          setExpandedSections((prev) => new Set([...prev, currentPath]))

          // Add the full path with array index
          currentPath = currentPath ? `${currentPath}.${part}` : part
        } else {
          currentPath = currentPath ? `${currentPath}.${part}` : part
          setExpandedSections((prev) => new Set([...prev, currentPath]))
        }
      }

      // Set the selected section
      setSelectedSection(path)

      // Force the sidebar to be open when selecting items in the editor
      const sidebarElement = document.querySelector("[data-sidebar]")
      if (sidebarElement && sidebarElement.getAttribute("data-state") !== "open") {
        const triggerButton = document.querySelector("[data-sidebar-trigger]")
        if (triggerButton) {
          triggerButton.click()
        }
      }
    },
    [findPathForPosition],
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

  // Add an event listener for cursor position changes in the editor
  useEffect(() => {
    if (!editorRef.current) return

    const disposable = editorRef.current.onDidChangeCursorPosition((e) => {
      highlightTreeForEditorSelection(e.position)
    })

    return () => {
      disposable.dispose()
    }
  }, [highlightTreeForEditorSelection])

  // Add an event listener for selection changes in the editor
  useEffect(() => {
    if (!editorRef.current) return

    const disposable = editorRef.current.onDidChangeCursorSelection(() => {
      handleEditorSelection()
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

      /* Tree navigation styling */
      [data-sidebar-menu-button] {
        transition: all 0.2s ease;
        border-radius: 0.25rem;
      }

      [data-sidebar-menu-button]:hover {
        background-color: hsl(var(--accent) / 0.7);
        color: hsl(var(--accent-foreground));
      }

      [data-sidebar-menu-button][data-active="true"] {
        background-color: hsl(var(--primary) / 0.15);
        color: hsl(var(--primary));
        font-weight: 500;
      }

      [data-sidebar-group-label] {
        transition: all 0.2s ease;
        border-radius: 0.25rem;
        margin-bottom: 2px;
      }

      [data-sidebar-group-label]:hover {
        background-color: hsl(var(--accent) / 0.7);
        color: hsl(var(--accent-foreground));
      }

      [data-sidebar-group-label][data-active="true"] {
        background-color: hsl(var(--primary) / 0.15);
        color: hsl(var(--primary));
        font-weight: 500;
      }

      /* Ensure expanded sections stay visible */
      [data-sidebar-group-content] {
        display: block !important;
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
    const handleKeyDown = (e) => {
      // Format with Shift+Alt+F
      if (e.shiftKey && e.altKey && e.key === "F") {
        e.preventDefault()
        formatYamlDocument()
      }
      // Copy with Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault()
        copyToClipboard()
      }
      // Download with Ctrl+S
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault()
        downloadYaml()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [formatYamlDocument, copyToClipboard, downloadYaml])

  // Then, update the return statement to use ResizablePanelGroup
  return (
    <SidebarProvider>
      <ResizablePanelGroup direction="horizontal" className="h-screen w-full">
        <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
          <Sidebar className="h-full border-r">
            <SidebarHeader className="border-b p-4">
              <h2 className="text-lg font-semibold">YAML Structure</h2>
            </SidebarHeader>
            <SidebarContent className="overflow-auto">{renderYamlTree(parsedYaml)}</SidebarContent>
          </Sidebar>
        </ResizablePanel>

        <ResizablePanel defaultSize={75}>
          <SidebarInset className="flex flex-col flex-1">
            <div className="flex items-center h-14 px-4 border-b">
              <SidebarTrigger />
              <h2 className="ml-2 text-lg font-medium">YAML Editor</h2>
              <div className="ml-auto flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={formatYamlDocument}>
                        <FileCode className="h-4 w-4 mr-1" />
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
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Validate
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Validate YAML syntax</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy YAML to clipboard</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={downloadYaml}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download YAML file</TooltipContent>
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

              <div className="h-full">
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
                    glyphMargin: true,
                    fixedOverflowWidgets: true,
                    selectOnLineNumbers: true,
                    lightbulb: {
                      enabled: true,
                    },
                    colorDecorators: true,
                    semanticHighlighting: {
                      enabled: true,
                    },
                    linkedEditing: true,
                    codeLens: true,
                    fontLigatures: true,
                    fontFamily: "'Fira Code', 'Droid Sans Mono', 'monospace'",
                    fontSize: 14,
                    lineHeight: 22,
                    padding: {
                      top: 10,
                      bottom: 10,
                    },
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
                    find: {
                      addExtraSpaceOnTop: false,
                    },
                    "editor.undoLimit": 100,
                    "editor.historySize": 100,
                  }}
                />
              </div>
              {!isEditorReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground">Loading editor...</p>
                  </div>
                </div>
              )}
            </div>
          </SidebarInset>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Simple Add Item Dialog */}
      <Dialog open={isAddingNewItem} onOpenChange={setIsAddingNewItem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {newItemType === "key-value" ? "Key-Value Pair" : "Item"}</DialogTitle>
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
                    autoFocus
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
                  autoFocus
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingNewItem(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (newItemType === "key-value" && newItemParent) {
                  addKeyValuePair(newItemParent, newKeyValuePair.key, newKeyValuePair.value)
                } else if (newItemParent) {
                  addNewItem(newItemType, newItemName, newItemParent)
                }
              }}
              disabled={
                (newItemType === "key-value" && (!newKeyValuePair.key || !newKeyValuePair.value)) ||
                (newItemType !== "key-value" && !newItemName)
              }
            >
              Add to YAML
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

