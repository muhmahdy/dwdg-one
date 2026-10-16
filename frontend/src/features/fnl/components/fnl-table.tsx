/* The table pieces the Finance & Legal pages share: head cell, body cell (the quiet second line is 12px at base, so it scales
   with density), the scrolling table and a row that opens a record. From divisions/div-fnl-mcit.js .fm-tbl. */
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { td, th, tblClass, tblScroll, trLink } from '@/components/shared/division-ui';
import { cn } from '@/lib/cn';

export const Th = ({ children, num }: { children?: ReactNode; num?: boolean }) => (
  <th className={cn(th, num && 'text-right')}>{children}</th>
);
export const Td = ({
  children,
  num,
  className,
  colSpan,
}: {
  children?: ReactNode;
  num?: boolean;
  className?: string;
  colSpan?: number;
}) => (
  <td colSpan={colSpan} className={cn(td, '[&_small]:block [&_small]:text-d12', num && 'text-right', className)}>
    {children}
  </td>
);

export function Tbl({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className={tblScroll}>
      <table className={tblClass}>
        <thead>
          <tr>{head}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/** A table row that opens a record (data-act="go"). */
export function LinkRow({ to, children, selected }: { to: string; children: ReactNode; selected?: boolean }) {
  const navigate = useNavigate();
  const go = () => {
    void navigate(`/${to}`);
  };
  return (
    <tr
      className={cn(trLink, selected && 'sel')}
      tabIndex={0}
      role="link"
      onClick={go}
      onKeyDown={(e) => {
        if (e.key === 'Enter') go();
      }}
    >
      {children}
    </tr>
  );
}
