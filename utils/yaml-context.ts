/**
 * Utility functions for determining YAML context
 */

/**
 * Determines if a line is part of an array
 */
export function isArrayItem(line: string): boolean {
    return /^\s*-\s/.test(line)
  }
  
  /**
   * Determines if a line is a key-value pair
   */
  export function isKeyValuePair(line: string): boolean {
    return /^\s*[^-:]+:\s*[^{[]/.test(line)
  }
  
  /**
   * Determines if a line is an object (has nested properties)
   */
  export function isObject(line: string): boolean {
    return /^\s*[^-:]+:\s*$/.test(line)
  }
  
  /**
   * Gets the indentation level of a line
   */
  export function getIndentLevel(line: string): number {
    const match = line.match(/^(\s*)/)
    return match ? match[1].length : 0
  }
  
  /**
   * Extracts the key from a line
   */
  export function extractKey(line: string): string | null {
    const match = line.match(/^\s*([^:]+):/)
    return match ? match[1].trim() : null
  }
  
  /**
   * Extracts the value from a line
   */
  export function extractValue(line: string): string | null {
    const match = line.match(/^\s*[^:]+:\s*(.*)/)
    return match ? match[1].trim() : null
  }
  
  /**
   * Extracts the array item value from a line
   */
  export function extractArrayItem(line: string): string | null {
    const match = line.match(/^\s*-\s*(.*)/)
    return match ? match[1].trim() : null
  }
  
  /**
   * Determines the context of a YAML section based on its content
   */
  export function determineYamlContext(
    lines: string[],
    startLine: number,
  ): {
    type: "array" | "object" | "key-value" | "unknown"
    indent: number
  } {
    // Skip empty lines and comments
    let currentLine = startLine
    while (currentLine < lines.length) {
      const line = lines[currentLine].trim()
      if (line !== "" && !line.startsWith("#")) {
        break
      }
      currentLine++
    }
  
    if (currentLine >= lines.length) {
      return { type: "unknown", indent: 0 }
    }
  
    const line = lines[currentLine]
    const indent = getIndentLevel(line)
  
    if (isArrayItem(line)) {
      return { type: "array", indent }
    } else if (isObject(line)) {
      return { type: "object", indent }
    } else if (isKeyValuePair(line)) {
      return { type: "key-value", indent }
    }
  
    return { type: "unknown", indent }
  }
  
  