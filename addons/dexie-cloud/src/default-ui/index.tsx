import Dexie from "dexie";
import "../extend-dexie-interface";
import { h, Component } from "preact";
import { from, Subscription } from "rxjs";
import { LoginDialog } from './LoginDialog';
import { DXCUserInteraction } from "../types/DXCUserInteraction";
import * as preact from "preact";

export interface Props {
  db: Dexie;
}

interface State {
  userInteraction: DXCUserInteraction | undefined;
}

export default class LoginGui extends Component<Props, State> {
  subscription?: Subscription;
  observer = (userInteraction: DXCUserInteraction | undefined) => this.setState({userInteraction});

  constructor(props: Props) {
    super(props);
    this.state = { userInteraction: undefined };
  }

  componentDidMount() {
    this.subscription = from(this.props.db.cloud.userInteraction).subscribe(this.observer);
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      delete this.subscription;
    }
  }

  render(props: Props, {userInteraction}: State) {
    if (!userInteraction) return null;
    
    // LoginDialog handles all interaction types uniformly
    // (forms with fields, options, or both)
    return <LoginDialog {...userInteraction as any} />;
  }
}

export function setupDefaultGUI(db: Dexie) {
  let closed = false;

  const el = document.createElement('div');
  if (document.body) {
    document.body.appendChild(el);
    preact.render(<LoginGui db={db.vip} />, el);
  } else {
    addEventListener('DOMContentLoaded', ()=>{
      if (!closed) {
        document.body.appendChild(el);
        preact.render(<LoginGui db={db.vip} />, el);
      }
    });
  }

  return {
    unsubscribe() {
      try { el.remove(); } catch {}
      closed = true;
    },
    get closed() {
      return closed;
    }
  }
}
