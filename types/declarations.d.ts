// This file provides module declarations for packages that have
// incomplete or missing type definitions in their npm dist.

// sonner v2.0.7 is missing .d.ts files in its dist folder
declare module "sonner" {
    import * as React from "react"

    export type ToastTypes =
        | "normal"
        | "action"
        | "success"
        | "error"
        | "loading"
        | "default"

    export interface ToastOptions {
        id?: string | number
        duration?: number
        description?: React.ReactNode
        action?: {
            label: React.ReactNode
            onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
        }
        cancel?: {
            label: React.ReactNode
            onClick?: () => void
        }
        onDismiss?: (toast: ToastOptions) => void
        onAutoClose?: (toast: ToastOptions) => void
        icon?: React.ReactNode
        position?:
            | "top-left"
            | "top-right"
            | "bottom-left"
            | "bottom-right"
            | "top-center"
            | "bottom-center"
        style?: React.CSSProperties
        className?: string
        classNames?: {
            toast?: string
            title?: string
            description?: string
            actionButton?: string
            cancelButton?: string
            closeButton?: string
        }
        dismissible?: boolean
        important?: boolean
    }

    export interface ToasterProps {
        theme?: "light" | "dark" | "system"
        richColors?: boolean
        expand?: boolean
        visibleToasts?: number
        position?:
            | "top-left"
            | "top-right"
            | "bottom-left"
            | "bottom-right"
            | "top-center"
            | "bottom-center"
        closeButton?: boolean
        toastOptions?: ToastOptions
        offset?: string | number
        className?: string
        style?: React.CSSProperties
        duration?: number
        gap?: number
        dir?: "rtl" | "ltr" | "auto"
        hotkey?: string[]
        invert?: boolean
        pauseWhenPageIsHidden?: boolean
    }

    export function Toaster(props: ToasterProps): React.ReactElement

    type ToastFunction = {
        (message: React.ReactNode, options?: ToastOptions): string | number
        success(message: React.ReactNode, options?: ToastOptions): string | number
        error(message: React.ReactNode, options?: ToastOptions): string | number
        warning(message: React.ReactNode, options?: ToastOptions): string | number
        info(message: React.ReactNode, options?: ToastOptions): string | number
        loading(message: React.ReactNode, options?: ToastOptions): string | number
        promise<T>(
            promise: Promise<T>,
            options: {
                loading: React.ReactNode
                success: React.ReactNode | ((data: T) => React.ReactNode)
                error: React.ReactNode | ((error: unknown) => React.ReactNode)
            } & ToastOptions
        ): string | number
        dismiss(id?: string | number): void
        custom(
            jsx: (id: string | number) => React.ReactElement,
            options?: ToastOptions
        ): string | number
    }

    export const toast: ToastFunction
}
