"use client"

import * as React from "react"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cva, VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "./utils"


const dialogVariants = cva("", {
  variants: {
    variant: {
      default: "",
      transparentForeground: "!backdrop-blur-none bg-foreground/40",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const Dialog = DialogPrimitive.Root
const DialogClose = DialogPrimitive.DialogClose

const DialogTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Trigger
    ref={ref}
    className={cn("cursor-pointer", className)}
    {...props}
  />
))

const DialogPortal = ({ ...props }: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal {...props} />
)
DialogPortal.displayName = DialogPrimitive.Portal.displayName

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      `fixed inset-0 z-50 bg-black-20 backdrop-blur-sm 
      data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
     `,
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
    VariantProps<typeof dialogVariants> & {
      closeButtonstyle?: string
      closeBtnColor?: string
    }
>(
  (
    { className, closeButtonstyle, closeBtnColor, variant, children, ...props },
    ref
  ) => (
    <DialogPortal>
      <DialogOverlay className={cn(dialogVariants({ variant }))} />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          `flex flex-col justify-center items-center p-6 gap-4 min-w-[475px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]
          fixed left-[50%] top-[50%] z-50 max-w-full translate-x-[-50%] translate-y-[-50%]
          bg-background duration-200 data-[state=open]:animate-in 
          data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 
          data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 
          data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg w-[calc(100%-5px)] sm:w-[420px] text-txt-color-600`,
          className
        )}
        {...props}
      >
        <div className="flex flex-col p-0 gap-6 w-full">{children}</div>

        <DialogPrimitive.Close
          onClick={() => document.getElementById("dialog-close")?.click()}
          className={cn(
            "absolute right-4 top-2 rounded-sm opacity-100 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-txt-color-200 z-50",
            "absolute py-2 px-4 right-4 top-2 border border-input hover:bg-accent hover:text-txt-color-500 border-none inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
            closeButtonstyle
          )}
        >
          <X
            className={cn("h-5 w-5", closeBtnColor && `text-${closeBtnColor}`)}
          />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col items-center gap-4 self-stretch ", className)}
    {...props}
  >
    {/* <div className={cn("flex flex-col space-y-1.5 text-left w-full")} {...props} /> */}
  </div>
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-row items-center justify-center p-0 gap-3 self-stretch w-full",
      className
    )}
    {...props}
  ></div>
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-headline-xs leading-none tracking-tight text-black-100 text-left ",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-body-lg text-black-100 text-center self-stretch w-full",
      className
    )}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
