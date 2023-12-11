import { Styles } from './Styles';
import { ComponentChildren, h } from 'preact';

export function Dialog({ children, className }: { children?: ComponentChildren, className?: string }) {
  return (
    <div className={className}>
      <div style={Styles.Darken} />
      <div style={Styles.DialogOuter}>
        <div style={Styles.DialogInner}>{children}</div>
      </div>
    </div>
  );
}
