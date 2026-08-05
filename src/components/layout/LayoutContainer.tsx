import { ReactNode } from "react";
import { TopNavbar } from "./TopNavbar";

// Ver Docs/03-Tecnico/Matriz-Componentes.md, seção 1
interface LayoutContainerProps {
  children: ReactNode;
}

export function LayoutContainer({ children }: LayoutContainerProps) {
  return (
    <div className="flex h-screen flex-col">
      <TopNavbar />
      <main className="flex-1 overflow-x-auto overflow-y-hidden">{children}</main>
    </div>
  );
}
