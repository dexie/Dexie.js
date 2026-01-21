import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { OAuthProviderInfo } from 'dexie-cloud-common';
import { Styles } from './Styles';

export interface AuthProviderButtonProps {
  provider: OAuthProviderInfo;
  onClick: () => void;
}

/** Cache for fetched SVG content to avoid re-fetching */
const svgCache: Record<string, string> = {};

/** Default SVG icons for built-in providers */
const ProviderIcons: Record<string, string> = {
  google: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
  github: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
  microsoft: `<svg viewBox="0 0 24 24" width="20" height="20"><rect fill="#F25022" x="1" y="1" width="10" height="10"/><rect fill="#00A4EF" x="1" y="13" width="10" height="10"/><rect fill="#7FBA00" x="13" y="1" width="10" height="10"/><rect fill="#FFB900" x="13" y="13" width="10" height="10"/></svg>`,
  apple: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>`,
};

/** Get provider-specific button styles */
function getProviderStyle(providerType: string): Record<string, string> {
  const baseStyle = { ...Styles.ProviderButton };
  
  switch (providerType) {
    case 'google':
      return { ...baseStyle, ...Styles.ProviderGoogle };
    case 'github':
      return { ...baseStyle, ...Styles.ProviderGitHub };
    case 'microsoft':
      return { ...baseStyle, ...Styles.ProviderMicrosoft };
    case 'apple':
      return { ...baseStyle, ...Styles.ProviderApple };
    default:
      return { ...baseStyle, ...Styles.ProviderCustom };
  }
}

/**
 * Button component for OAuth provider login.
 * Displays the provider's icon and name following provider branding guidelines.
 */
export function AuthProviderButton({ provider, onClick }: AuthProviderButtonProps) {
  const { type, name, displayName, iconUrl } = provider;
  const style = getProviderStyle(type);
  
  // Determine button text
  const buttonText = `Continue with ${displayName}`;
  
  // Get icon - use custom iconUrl if provided, otherwise use built-in SVG
  const iconSvg = ProviderIcons[type] || '';
  
  // Check if iconUrl is an SVG (supports currentColor when inlined)
  const isSvgIcon = iconUrl?.toLowerCase().endsWith('.svg');
  
  // State for fetched SVG content (for inline rendering with currentColor support)
  const [fetchedSvg, setFetchedSvg] = useState<string | null>(
    iconUrl && isSvgIcon ? (svgCache[iconUrl] || null) : null
  );
  
  // Fetch SVG content if iconUrl points to an SVG file
  useEffect(() => {
    if (!iconUrl || !isSvgIcon) return;
    
    // Check cache first
    if (svgCache[iconUrl]) {
      setFetchedSvg(svgCache[iconUrl]);
      return;
    }
    
    // Fetch SVG and cache it
    fetch(iconUrl)
      .then(res => {
        if (res.ok) {
          return res.text();
        }
        return null;
      })
      .then(svg => {
        if (svg) {
          svgCache[iconUrl] = svg;
          setFetchedSvg(svg);
        }
      })
      .catch(() => {
        // Silently fail - will show no icon
      });
  }, [iconUrl, isSvgIcon]);
  
  // Get the text color from the button style for SVG fill
  const textColor = style.color || '#000000';
  
  // Process SVG to use the button's text color instead of currentColor
  const processedSvg = fetchedSvg 
    ? fetchedSvg
        .replace(/fill="currentColor"/gi, `fill="${textColor}"`)
        .replace(/fill='currentColor'/gi, `fill='${textColor}'`)
    : null;
  
  // Debug log
  if (fetchedSvg && iconUrl) {
    console.log('Icon URL:', iconUrl);
    console.log('Text color:', textColor);
    console.log('Original SVG has currentColor:', fetchedSvg.includes('currentColor'));
    console.log('Processed SVG has textColor:', processedSvg?.includes(textColor));
  }
  
  // Render the appropriate icon
  const renderIcon = () => {
    // SVG fetched and inlined
    if (processedSvg) {
      return (
        <span
          style={Styles.ProviderButtonIcon}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: processedSvg }}
        />
      );
    }
    // Non-SVG image (jpg, png, etc.) - use img tag
    if (iconUrl && !isSvgIcon) {
      return (
        <img
          src={iconUrl}
          alt=""
          style={Styles.ProviderButtonIcon}
          aria-hidden="true"
        />
      );
    }
    // Built-in SVG icon
    if (iconSvg) {
      return (
        <span
          style={Styles.ProviderButtonIcon}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: iconSvg }}
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
      class={`dxc-provider-btn dxc-provider-${type}`}
      aria-label={buttonText}
    >
      {renderIcon()}
      <span style={Styles.ProviderButtonText}>{buttonText}</span>
    </button>
  );
}

/** Email/envelope icon for OTP button */
const EmailIcon = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6L12 13 2 6"/></svg>`;

/**
 * Button for email/OTP authentication option.
 */
export function OtpButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      style={Styles.OtpButton}
      onClick={onClick}
      class="dxc-otp-btn"
      aria-label="Continue with email"
    >
      <span
        style={Styles.ProviderButtonIcon}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: EmailIcon }}
      />
      <span style={Styles.ProviderButtonText}>Continue with email</span>
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
