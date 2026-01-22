import { Dialog } from './Dialog';
import { Styles } from './Styles';
import { h, Fragment } from 'preact';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { DXCUserInteraction, DXCOption } from '../types/DXCUserInteraction';
import { resolveText } from '../helpers/resolveText';
import { DXCInputField } from '../types/DXCInputField';
import { OptionButton, Divider } from './OptionButton';
import { DXCAlert } from '../types/DXCAlert';

const OTP_LENGTH = 8;

/** Props for LoginDialog - accepts any user interaction */
interface LoginDialogProps {
  title: string;
  alerts: DXCAlert[];
  fields: { [name: string]: DXCInputField };
  options?: DXCOption[];
  submitLabel?: string;
  cancelLabel?: string | null;
  onSubmit: (params: { [paramName: string]: string }) => void;
  onCancel: () => void;
}

/**
 * Generic dialog that can render:
 * - Form fields (text inputs)
 * - Selectable options (buttons)
 * - Or both together
 * 
 * When an option is clicked, calls onSubmit({ [option.name]: option.value }).
 * This unified approach means the same callback handles both form submission
 * and option selection.
 */
export function LoginDialog({
  title,
  alerts,
  fields,
  options,
  submitLabel,
  cancelLabel,
  onCancel,
  onSubmit,
}: LoginDialogProps) {
  const [params, setParams] = useState<{ [param: string]: string }>({});

  const firstFieldRef = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => firstFieldRef.current?.focus(), []);

  const fieldEntries = Object.entries(fields || {}) as [string, DXCInputField][];
  const hasFields = fieldEntries.length > 0;
  const hasOptions = options && options.length > 0;

  // Group options by name to detect if we have multiple groups
  const optionGroups = new Map<string, typeof options>();
  if (options) {
    for (const option of options) {
      const group = optionGroups.get(option.name) || [];
      group.push(option);
      optionGroups.set(option.name, group);
    }
  }
  const hasMultipleGroups = optionGroups.size > 1;

  // Handler for option clicks - calls onSubmit with { [option.name]: option.value }
  const handleOptionClick = (option: DXCOption) => {
    onSubmit({ [option.name]: option.value });
  };

  return (
    <Dialog className="dxc-login-dlg">
      <>
        <h3 style={Styles.WindowHeader}>{title}</h3>
        {alerts.map((alert, idx) => (
          <p key={idx} style={Styles.Alert[alert.type]}>{resolveText(alert)}</p>
        ))}

        {/* Render options if present */}
        {hasOptions && (
          <div class="dxc-options">
            {hasMultipleGroups ? (
              // Render with dividers between groups
              Array.from(optionGroups.entries()).map(([groupName, groupOptions], groupIdx) => (
                <Fragment key={groupName}>
                  {groupIdx > 0 && <Divider />}
                  {groupOptions!.map((option) => (
                    <OptionButton
                      key={`${option.name}-${option.value}`}
                      option={option}
                      onClick={() => handleOptionClick(option)}
                    />
                  ))}
                </Fragment>
              ))
            ) : (
              // Simple case: all options in one group
              options!.map((option) => (
                <OptionButton
                  key={`${option.name}-${option.value}`}
                  option={option}
                  onClick={() => handleOptionClick(option)}
                />
              ))
            )}
          </div>
        )}

        {/* Divider between options and fields if both are present */}
        {hasOptions && hasFields && <Divider />}

        {/* Render form fields if present */}
        {hasFields && (
          <form
            onSubmit={(ev) => {
              ev.preventDefault();
              onSubmit(params);
            }}
          >
            {fieldEntries.map(
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
        )}
      </>
      <div style={Styles.ButtonsDiv}>
        <>
          {/* Show submit button if there are fields, OR if there are no options and no fields (e.g., message alert) */}
          {submitLabel && (hasFields || (!hasOptions && !hasFields)) && (
            <button
              type="submit"
              style={Styles.PrimaryButton}
              onClick={() => onSubmit(params)}
            >
              {submitLabel}
            </button>
          )}
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
