import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon, CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
// Lưu ý: Đảm bảo các file này đã tồn tại trong thư mục components/ui của bạn
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * 1. SỬA LỖI INPUT GROUP: 
 * Nếu bạn chưa có file input-group.tsx riêng biệt, 
 * đoạn mã dưới đây sẽ tự định nghĩa một Wrapper đơn giản để tránh lỗi Module not found.
 */
function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className="flex items-center border-b px-3 py-2">
      <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
}

/**
 * 2. TỐI ƯU HÓA COMMAND ITEM:
 * Sửa lại cách hiển thị CheckIcon và trạng thái được chọn (Selected)
 */
function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
      {/* CheckIcon sẽ chỉ xuất hiện khi item có thuộc tính data-checked */}
      <CheckIcon className="ml-auto h-4 w-4 opacity-0 in-data-[checked=true]:opacity-100" />
    </CommandPrimitive.Item>
  )
}

/**
 * 3. TỐI ƯU COMMAND DIALOG:
 * Đảm bảo DialogContent không bị che khuất và hiển thị đúng giữa màn hình
 */
function CommandDialog({
  title = "Menu tìm kiếm nhanh",
  description = "Tìm kiếm bài học, thuật ngữ kế toán hoặc văn bản luật...",
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & { title?: string; description?: string }) {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children as React.ReactNode}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

/**
 * CÁC THÀNH PHẦN KHÁC (GIỮ NGUYÊN NHƯNG TỐI ƯU CSS)
 */
function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className)}
      {...props}
    />
  )
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  )
}

function CommandEmpty({ ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty className="py-6 text-center text-sm" {...props} />
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn("overflow-hidden p-1 text-foreground", className)}
      {...props}
    />
  )
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
}
