"use client"

import { useToast } from "../../../hooks/use-toaster"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast"
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons"
export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, category, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex gap-2 justify-center items-center">
              {category === 'error' && <CrossCircledIcon className="w-8 h-8 text-red-500" />}
              {category === 'success' && <CheckCircledIcon className="w-8 h-8 text-green-500" />}

              <div className="flex flex-col">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (

                  <ToastDescription>{description}</ToastDescription>
                )}

              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
