import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-brand-dark/10", className)}>
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-brand-dark/10 bg-brand-light text-xs uppercase tracking-wide text-brand-dark/50">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-brand-dark/5 bg-white">{children}</tbody>;
}

export function TableRow({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn("transition-colors hover:bg-brand-light/60", className)}>{children}</tr>;
}

export function TableCell({ children, className, header }: { children: ReactNode; className?: string; header?: boolean }) {
  const Tag = header ? "th" : "td";
  return (
    <Tag className={cn("px-5 py-3.5", header ? "font-medium text-brand-dark" : "text-brand-dark/80", className)}>
      {children}
    </Tag>
  );
}

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string }>({ columns, data }: { columns: Column<T>[]; data: T[] }) {
  return (
    <Table>
      <TableHead>
        <tr>
          {columns.map((col) => (
            <TableCell key={col.key} header className={col.className}>
              {col.header}
            </TableCell>
          ))}
        </tr>
      </TableHead>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            {columns.map((col) => (
              <TableCell key={col.key} className={col.className}>
                {col.render(row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
