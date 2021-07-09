import "./SvgIcon.css";
import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
  className?: string;
  title?: string;
}

export function SvgIcon({ children, className, title }: Props) {
  return <div className={"svg-icon" + (className ? ' ' + className : '')} title={title}>
    <div>{children}</div>
  </div>;
}
