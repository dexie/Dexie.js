import { h } from 'preact';
import { DXCOption } from '../types/DXCUserInteraction';
import { Styles } from './Styles';

export interface OptionButtonProps {
  option: DXCOption;
  onClick: () => void;
}

/** Get style based on styleHint (for provider branding, etc.) */
function getOptionStyle(styleHint?: string): Record<string, string> {
  const baseStyle = { ...Styles.ProviderButton };
  
  if (!styleHint) {
    return baseStyle;
  }
  
  switch (styleHint) {
    case 'google':
      return { ...baseStyle, ...Styles.ProviderGoogle };
    case 'github':
      return { ...baseStyle, ...Styles.ProviderGitHub };
    case 'microsoft':
      return { ...baseStyle, ...Styles.ProviderMicrosoft };
    case 'apple':
      return { ...baseStyle, ...Styles.ProviderApple };
    case 'otp':
      return { ...Styles.OtpButton };
    case 'custom-oauth2':
      return { ...baseStyle, ...Styles.ProviderCustom };
    default:
      return baseStyle;
  }
}

/**
 * Generic button component for selectable options.
 * Displays the option's icon and display name.
 * 
 * The icon can be:
 * - Inline SVG (iconSvg) - rendered directly with dangerouslySetInnerHTML
 * - Image URL (iconUrl) - rendered as an img tag
 * 
 * Style is determined by the styleHint property for branding purposes.
 */
export function OptionButton({ option, onClick }: OptionButtonProps) {
  const { displayName, iconUrl, iconSvg, styleHint, value } = option;
  const style = getOptionStyle(styleHint);
  
  // Get the text color from the button style for SVG fill processing
  const textColor = style.color || '#000000';
  
  // Process SVG to replace currentColor with actual text color
  const processedSvg = iconSvg 
    ? iconSvg
        .replace(/fill="currentColor"/gi, `fill="${textColor}"`)
        .replace(/fill='currentColor'/gi, `fill='${textColor}'`)
        .replace(/stroke="currentColor"/gi, `stroke="${textColor}"`)
        .replace(/stroke='currentColor'/gi, `stroke='${textColor}'`)
    : null;
  
  // Render the appropriate icon
  const renderIcon = () => {
    // Inline SVG
    if (processedSvg) {
      return (
        <span
          style={Styles.ProviderButtonIcon}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: processedSvg }}
        />
      );
    }
    // Image URL
    if (iconUrl) {
      return (
        <img
          src={iconUrl}
          alt=""
          style={Styles.ProviderButtonIcon}
          aria-hidden="true"
        />
      );
    }
    return null;
  };
  
  return (
    <button
      type="button"
      style={style}
      onClick={onClick}
      class={`dxc-option-btn${styleHint ? ` dxc-option-${styleHint}` : ''}`}
      aria-label={displayName}
    >
      {renderIcon()}
      <span style={Styles.ProviderButtonText}>{displayName}</span>
    </button>
  );
}

/**
 * Visual divider with "or" text.
 */
export function Divider() {
  return (
    <div style={Styles.Divider}>
      <div style={Styles.DividerLine} />
      <span style={Styles.DividerText}>or</span>
      <div style={Styles.DividerLine} />
    </div>
  );
}
