import Dexie from "dexie";
import "../extend-dexie-interface";
import { h, Component } from "preact";
import { from, Observer, Subscription } from "rxjs";
import { LoginDialog } from './LoginDialog';
import { Styles } from "./Styles";
import { DXCGenericUserInteraction, DXCUserInteraction } from "../types/DXCUserInteraction";
import { DXCInputField } from "../types/DXCInputField";
import { DexieCloudDB } from "../db/DexieCloudDB";
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
    //if (props.db.cloud.userInteraction.observers.length > 1) return null; // Someone else subscribes.
    return <LoginDialog {...userInteraction as DXCGenericUserInteraction<string, {[name: string]: DXCInputField}>} />;
  }
}

export function setupDefaultGUI(db: Dexie) {
  const el = document.createElement('div');
  document.body.appendChild(el);
  preact.render(<LoginGui db={db.vip} />, el);

  let closed = false;

  return {
    unsubscribe() {
      el.remove();
      closed = true;
    },
    get closed() {
      return closed;
    }
  }
}

// TODO:
/*
    * Gjort klart allt kring user interaction förutom att mounta default-ui på ett element.
    * Också att kolla först om nån annan subscribar och i så fall inte göra nåt.
*/