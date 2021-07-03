import { Styles } from './Styles';
import { ComponentChildren, h } from "preact";

export function Dialog ({children}: {children?: ComponentChildren}) {
  return <div style={Styles.DialogOuter}>
    <div style={Styles.DialogInner}>
      {children}
    </div>
  </div>;
}
