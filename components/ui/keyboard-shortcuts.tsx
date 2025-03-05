import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface KeyboardShortcutsProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcuts({ isOpen, onOpenChange }: KeyboardShortcutsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Shortcut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Format YAML</TableCell>
              <TableCell>Shift + Alt + F</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Copy to Clipboard</TableCell>
              <TableCell>Ctrl + Shift + C</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Save/Download</TableCell>
              <TableCell>Ctrl + S</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Show Shortcuts</TableCell>
              <TableCell>Ctrl + /</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}

