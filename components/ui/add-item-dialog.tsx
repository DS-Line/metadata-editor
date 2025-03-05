"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"

interface AddItemDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newItemType: string | null
  newItemName: string
  setNewItemName: (name: string) => void
  newKeyValuePair: { key: string; value: string }
  setNewKeyValuePair: (pair: { key: string; value: string }) => void
  newItemParent: string | null
  addNewItem: (type: string, name: string, parent: string) => void
  addKeyValuePair: (parent: string, key: string, value: string) => void
  contextType?: "array" | "object" | "key-value" | "unknown"
}

export function AddItemDialog({
  isOpen,
  onOpenChange,
  newItemType,
  newItemName,
  setNewItemName,
  newKeyValuePair,
  setNewKeyValuePair,
  newItemParent,
  addNewItem,
  addKeyValuePair,
  contextType = "unknown",
}: AddItemDialogProps) {
  const [itemType, setItemType] = useState(newItemType || "key-value")

  // Update item type when context changes
  useEffect(() => {
    if (contextType === "array") {
      setItemType("array-item")
    } else if (contextType === "object") {
      setItemType("object")
    } else if (contextType === "key-value") {
      setItemType("key-value")
    } else if (newItemType) {
      setItemType(newItemType)
    }
  }, [contextType, newItemType])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New {itemType === "key-value" ? "Key-Value Pair" : "Item"}</DialogTitle>
        </DialogHeader>

        {/* Item Type Selector */}
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="item-type" className="text-right">
              Type
            </Label>
            <Select value={itemType} onValueChange={setItemType} disabled={!!newItemType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select item type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="key-value">Key-Value Pair</SelectItem>
                <SelectItem value="array-item">Array Item</SelectItem>
                <SelectItem value="object">Object</SelectItem>
                {newItemType === "department" && <SelectItem value="department">Department</SelectItem>}
                {newItemType === "technology" && <SelectItem value="technology">Technology</SelectItem>}
                {newItemType === "strategy" && <SelectItem value="strategy">Strategy</SelectItem>}
                {newItemType === "region" && <SelectItem value="region">Region</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          {/* Input fields based on type */}
          {itemType === "key-value" ? (
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
                {itemType === "array-item" ? "Value" : "Name"}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (itemType === "key-value" && newItemParent) {
                addKeyValuePair(newItemParent, newKeyValuePair.key, newKeyValuePair.value)
              } else if (newItemParent) {
                addNewItem(itemType, newItemName, newItemParent)
              }
            }}
            disabled={
              (itemType === "key-value" && (!newKeyValuePair.key || !newKeyValuePair.value)) ||
              (itemType !== "key-value" && !newItemName)
            }
          >
            Add to YAML
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

