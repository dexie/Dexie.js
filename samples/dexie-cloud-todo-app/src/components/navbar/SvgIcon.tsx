import "./SvgIcon.css";
import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
  className?: string;
}

export function SvgIcon({ children, className }: Props) {
  return <div className={"svg-icon" + (className ? ' ' + className : '')}>
    {children}
  </div>;
}
