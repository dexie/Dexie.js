import {
  LoginState,
  LoginStateError,
  LoginStateInteraction,
  LoginStateSilent,
} from "../types/LoginState";
import { Dialog } from "./Dialog";
import { Styles } from "./Styles";
import { h, Fragment } from "preact";
import { useState } from "preact/hooks";

export function LoginDialog(props: LoginStateInteraction) {
  const [params, setParams] = useState<{
    email?: string;
    otp?: string;
    name?: string;
  }>({});

  return (
    <Dialog>
      {props.interactionType === "emailRequested" ? (
        <>
          <h3 style={Styles.WindowHeader}>Login</h3>
          <label style={Styles.Label}>
            Email address
            <input
              type="text"
              style={Styles.Input}
              autofocus
              placeholder="you@example.com"
              value={params.email || ""}
              disabled={props.isWorking}
              onChange={(ev) =>
                setParams({ ...params, email: ev.target!["value"] })
              }
            />
          </label>
        </>
      ) : (
        props.interactionType === "otpRequested" && (
          <>
            <h3 style={Styles.WindowHeader}>Login</h3>
            <label style={Styles.Label}>What's your name?
              <input
                type="text"
                style={Styles.Input}
                autofocus
                placeholder="Your full name (optional)"
                disabled={props.isWorking}
                value={params.name || ""}
                onChange={(ev) =>
                  setParams({ ...params, name: ev.target!["value"] })
                }
              />
            </label>
            <label style={Styles.Label}>Paste OTP (check your email)
            <input
              type="text"
              style={Styles.Input}
              placeholder="Paste OTP here"
              disabled={props.isWorking}
              value={params.otp || ""}
              onChange={(ev) =>
                setParams({ ...params, otp: ev.target!["value"] })
              }
            />
            </label>
          </>
        )
      )}
      {props.alerts && (
        <ul style={Styles.AlertsUl}>
          {props.alerts.map((alert) => (
            <li style={{ ...Styles.AlertsLi, ...Styles[alert.type] }}>
              {alert.message}
            </li>
          ))}
        </ul>
      )}
      <div style={Styles.ButtonsDiv}>
        <button style={Styles.Button} disabled={props.isWorking} onClick={() => props.onSubmit(params)}>
          {props.submitText}
        </button>
        <button style={Styles.Button} onClick={props.onCancel}>Cancel</button>
      </div>
    </Dialog>
  );
}
