import { h, Fragment } from 'preact';
import { Dialog } from './Dialog';
import { Styles } from './Styles';
import { AuthProviderButton, OtpButton, Divider } from './AuthProviderButton';
import { DXCProviderSelection } from '../types/DXCUserInteraction';
import { resolveText } from '../helpers/resolveText';

/**
 * Dialog component for OAuth provider selection.
 * Displays available OAuth providers as buttons and optionally an email/OTP option.
 */
export function ProviderSelectionDialog({
  title,
  alerts,
  providers,
  otpEnabled,
  cancelLabel,
  onSelectProvider,
  onSelectOtp,
  onCancel,
}: DXCProviderSelection) {
  return (
    <Dialog className="dxc-provider-selection-dlg">
      <>
        <h3 style={Styles.WindowHeader}>{title}</h3>
        
        {/* Display any alerts */}
        {alerts.map((alert, idx) => (
          <p key={idx} style={Styles.Alert[alert.type]}>
            {resolveText(alert)}
          </p>
        ))}
        
        {/* OAuth provider buttons */}
        <div class="dxc-providers">
          {providers.map((provider) => (
            <AuthProviderButton
              key={provider.name}
              provider={provider}
              onClick={() => onSelectProvider(provider.name)}
            />
          ))}
        </div>
        
        {/* Show divider and email option if OTP is enabled */}
        {otpEnabled && providers.length > 0 && (
          <>
            <Divider />
            <OtpButton onClick={onSelectOtp} />
          </>
        )}
        
        {/* If only OTP is available (no providers), show just the email button */}
        {otpEnabled && providers.length === 0 && (
          <OtpButton onClick={onSelectOtp} />
        )}
        
        {/* Cancel button */}
        {cancelLabel && (
          <div style={Styles.CancelButtonRow}>
            <button
              type="button"
              style={Styles.Button}
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          </div>
        )}
      </>
    </Dialog>
  );
}
