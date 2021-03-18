import Dexie from "dexie";
import "../extend-dexie-interface";
import { h, Component } from "preact";
import { from, Subscription } from "rxjs";
import { LoginState } from "../types/LoginState";
import { LoginDialog } from './LoginDialog';
import { Styles } from "./Styles";

export interface Props {
  db: Dexie;
}

export default class LoginGui extends Component<Props, LoginState> {
  subscription?: Subscription;

  constructor(props: Props) {
    super(props);
    this.state = { type: "silent" };
  }

  componentDidMount() {
    this.subscription = from(this.props.db.cloud.loginStateObservable).subscribe({
      next: (state) => this.setState(state),
      error: (error) =>
        this.setState({ type: "error", message: error?.message || error }),
    });
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      delete this.subscription;
    }
  }

  render(props: Props, state: LoginState) {
    if (state.type === "error") {
      return <p style={Styles.Error}>{state.message}</p>;
    }
    if (state.type === "interaction") {
      return <LoginDialog {...state} />;
    }
    return null;
  }
}
