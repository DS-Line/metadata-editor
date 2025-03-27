// @ts-nocheck

import React from "react"

import {
  CircleArrowDown,
  CircleArrowUp,
  EllipsisVertical,
  FilePlus,
} from "lucide-react"

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
} from "./tooltip"

interface MenuItems {
  generate: boolean
  upload: boolean
  addYaml: boolean
  regenerateFlag?: boolean
}

export default function MetadataOptions({
  menuItems,
  handleUploadClick,
  handleGenerate,
  addMetadata,
  metadataType,
  setDialog,
}: {
  menuItems: MenuItems
  handleUploadClick: () => void
  handleGenerate: () => void
  addMetadata: () => void
  metadataType: string
  setDialog: React.Dispatch<React.SetStateAction<boolean>>
}) {
  //   const setMetadataStatus = useSetAtom(metadataEditorStatusAtom)
  //   const setMetadataDetails = useSetAtom(metadataDetailsAtom)
  //   const agentDetails = useAtomValue(agentDetailsAtom)
  //   const metadataEmpty = useAtomValue(metadataListEmptyAtom)
  //   const setQuery = useSetAtom(yamlEditorDataAtom)
  //   const setPersonalizedQuery = useSetAtom(personalizationYamlEditorDataAtom)

  //   const { mutate: generate } = useGenerateMetadata()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center cursor-pointer">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <EllipsisVertical
                size={18}
                className="cursor-pointer text-txt-color-300 hover:text-primary outline-none"
              />
            </TooltipTrigger>
            <TooltipContent>More Options</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 [&>*]:px-2 [&>*]:cursor-pointer [&>*]:hover:rounded-none">
        {menuItems.generate && (
          <DropdownMenuItem
            className="flex flex-row gap-2 mx-[-8px] focus:bg-accent "
            onClick={() => {
              if (menuItems.regenerateFlag) {
                setDialog(true)
              } else {
                handleGenerate()
              }
            }}
          >
            <CircleArrowDown
              size={18}
              className="cursor-pointer text-txt-color-300 hover:text-primary"
            />
            <span>
              {menuItems.regenerateFlag
                ? "Regenerate Metadata"
                : "Generate Metadata"}
            </span>
          </DropdownMenuItem>
        )}
        {menuItems.upload && (
          <DropdownMenuItem
            className="flex flex-row gap-2 mx-[-8px] focus:bg-accent"
            onClick={handleUploadClick}
          >
            <CircleArrowUp
              size={18}
              className="cursor-pointer text-txt-color-300 hover:text-primary"
            />
            <span>Upload Metadata</span>
          </DropdownMenuItem>
        )}
        {menuItems.addYaml && (
          <DropdownMenuItem
            className="flex flex-row gap-2 mx-[-8px] focus:bg-accent"
            onClick={addMetadata}
          >
            <FilePlus
              size={18}
              className="cursor-pointer text-txt-color-300 hover:text-primary"
            />
            <span>Add YAML</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
