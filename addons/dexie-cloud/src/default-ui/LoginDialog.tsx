import { Dialog } from './Dialog';
import { Styles } from './Styles';
import { h, Fragment } from 'preact';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import {
  DXCGenericUserInteraction,
  DXCUserInteraction,
} from '../types/DXCUserInteraction';
import { resolveText } from '../helpers/resolveText';
import { DXCInputField } from '../types/DXCInputField';

export function LoginDialog({
  title,
  alerts,
  fields,
  onCancel,
  onSubmit,
}: DXCGenericUserInteraction<string, { [name: string]: DXCInputField }>) {
  const [params, setParams] = useState<{ [param: string]: string }>({});

  const firstFieldRef = useRef<HTMLInputElement>();
  useLayoutEffect(()=>firstFieldRef.current?.focus(), []);

  return (
    <Dialog>
      <>
        <h3 style={Styles.WindowHeader}>{title}</h3>
        {alerts.map((alert) => (
          <p style={Styles.Alert[alert.type]}>{resolveText(alert)}</p>
        ))}
        <form onSubmit={ev => {
          ev.preventDefault();
          onSubmit(params);
        }}>
        {Object.entries(fields).map(
          ([fieldName, { type, label, placeholder }], idx) => (
            <label style={Styles.Label}>
              {label ? `${label}: ` : ''}
              <input
                ref={idx === 0 ? firstFieldRef : undefined}
                type={type}
                name={fieldName}
                autoComplete="on"
                style={Styles.Input}
                autoFocus
                placeholder={placeholder}
                value={params[fieldName] || ''}
                onInput={(ev) =>
                  setParams({ ...params, [fieldName]: valueTransformer(type, ev.target?.['value']) })
                }
              />
            </label>
          )
        )}
        </form>
      </>
      <div style={Styles.ButtonsDiv}>
        <button type="submit" style={Styles.Button} onClick={() => onSubmit(params)}>
          Submit
        </button>
        <button style={Styles.Button} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </Dialog>
  );
}

function valueTransformer(type: string, value: string) {
  switch(type) {
    case "email": return value.toLowerCase();
    case "otp": return value.toUpperCase();
    default: return value;
  }
}