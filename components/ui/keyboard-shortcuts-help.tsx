import { Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function KeyboardShortcutsHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Keyboard shortcuts">
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to work more efficiently with the YAML editor.
          </DialogDescription>
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
              <TableCell>
                <kbd className="px-2 py-1 bg-muted rounded">Shift</kbd> +{" "}
                <kbd className="px-2 py-1 bg-muted rounded">Alt</kbd> +{" "}
                <kbd className="px-2 py-1 bg-muted rounded">F</kbd>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Copy to Clipboard</TableCell>
              <TableCell>
                <kbd className="px-2 py-1 bg-muted rounded">Ctrl</kbd> +{" "}
                <kbd className="px-2 py-1 bg-muted rounded">Shift</kbd> +{" "}
                <kbd className="px-2 py-1 bg-muted rounded">C</kbd>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Save/Download</TableCell>
              <TableCell>
                <kbd className="px-2 py-1 bg-muted rounded">Ctrl</kbd> +{" "}
                <kbd className="px-2 py-1 bg-muted rounded">S</kbd>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Undo</TableCell>
              <TableCell>
                <kbd className="px-2 py-1 bg-muted rounded">Ctrl</kbd> +{" "}
                <kbd className="px-2 py-1 bg-muted rounded">Z</kbd>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Redo</TableCell>
              <TableCell>
                <kbd className="px-2 py-1 bg-muted rounded">Ctrl</kbd> +{" "}
                <kbd className="px-2 py-1 bg-muted rounded">Y</kbd> or{" "}
                <kbd className="px-2 py-1 bg-muted rounded">Ctrl</kbd> +{" "}
                <kbd className="px-2 py-1 bg-muted rounded">Shift</kbd> +{" "}
                <kbd className="px-2 py-1 bg-muted rounded">Z</kbd>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Find</TableCell>
              <TableCell>
                <kbd className="px-2 py-1 bg-muted rounded">Ctrl</kbd> +{" "}
                <kbd className="px-2 py-1 bg-muted rounded">F</kbd>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Replace</TableCell>
              <TableCell>
                <kbd className="px-2 py-1 bg-muted rounded">Ctrl</kbd> +{" "}
                <kbd className="px-2 py-1 bg-muted rounded">H</kbd>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}

