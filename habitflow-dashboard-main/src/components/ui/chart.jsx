import * as React from "react"
import { cn } from "@/lib/utils"

const Chart = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex aspect-video justify-center text-xs", className)}
    {...props}
  />
))
Chart.displayName = "Chart"

export { Chart }