import { Dialog } from './Dialog';
import { Styles } from './Styles';
import { h, Fragment } from 'preact';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { DXCUserInteraction, DXCProviderSelection } from '../types/DXCUserInteraction';
import { resolveText } from '../helpers/resolveText';
import { DXCInputField } from '../types/DXCInputField';

const OTP_LENGTH = 8;

/** User interactions that have the standard form-based structure */
type FormBasedInteraction = Exclude<DXCUserInteraction, DXCProviderSelection>;

export function LoginDialog({
  title,
  type,
  alerts,
  fields,
  submitLabel,
  cancelLabel,
  onCancel,
  onSubmit,
}: FormBasedInteraction) {
  const [params, setParams] = useState<{ [param: string]: string }>({});

  const firstFieldRef = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => firstFieldRef.current?.focus(), []);

  return (
    <Dialog className="dxc-login-dlg">
      <>
        <h3 style={Styles.WindowHeader}>{title}</h3>
        {alerts.map((alert) => (
          <p style={Styles.Alert[alert.type]}>{resolveText(alert)}</p>
        ))}
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            onSubmit(params);
          }}
        >
          {(Object.entries(fields) as [string, DXCInputField][]).map(
            ([fieldName, { type, label, placeholder }], idx) => (
              <label style={Styles.Label} key={idx}>
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
                  onInput={(ev) => {
                    const value = valueTransformer(type, ev.target?.['value']);
                    let updatedParams = {
                      ...params,
                      [fieldName]: value,
                    };
                    setParams(updatedParams);
                    if (type === 'otp' && value?.trim().length === OTP_LENGTH) {
                      // Auto-submit when OTP is filled in.
                      onSubmit(updatedParams);
                    }
                  }}
                />
              </label>
            )
          )}
        </form>
      </>
      <div style={Styles.ButtonsDiv}>
        <>
          <button
            type="submit"
            style={Styles.PrimaryButton}
            onClick={() => onSubmit(params)}
          >
            {submitLabel}
          </button>
          {cancelLabel && (
            <button style={Styles.Button} onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
        </>
      </div>
    </Dialog>
  );
}

function valueTransformer(type: string, value: string) {
  switch (type) {
    case 'email':
      return value.toLowerCase();
    case 'otp':
      return value.toUpperCase();
    default:
      return value;
  }
}
