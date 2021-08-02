import Dexie from "dexie";
import "../extend-dexie-interface";
import { h, Component } from "preact";
import { Subscription } from "rxjs";
import { DXCUserInteraction } from "../types/DXCUserInteraction";
export interface Props {
    db: Dexie;
}
interface State {
    userInteraction: DXCUserInteraction | undefined;
}
export default class LoginGui extends Component<Props, State> {
    subscription?: Subscription;
    observer: (userInteraction: DXCUserInteraction | undefined) => void;
    constructor(props: Props);
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(props: Props, { userInteraction }: State): h.JSX.Element | null;
}
export declare function setupDefaultGUI(db: Dexie): {
    unsubscribe(): void;
    readonly closed: boolean;
};
export {};
