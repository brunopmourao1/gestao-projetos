import * as React from "react"

import { cn } from "@/lib/utils"

// Bloco --muted com animação de pulso (1.4s) — usado em todo carregamento
// de dados da interface. Nunca spinner, nunca texto "Carregando...".
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-[pulso_1.4s_ease_infinite] rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
