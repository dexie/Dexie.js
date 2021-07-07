import { Styles } from './Styles';
import { ComponentChildren, h } from 'preact';

export function Dialog({ children }: { children?: ComponentChildren }) {
  return (
    <div>
      <div style={Styles.Darken} />
      <div style={Styles.DialogOuter}>
        <div style={Styles.DialogInner}>{children}</div>
      </div>
    </div>
  );
}
