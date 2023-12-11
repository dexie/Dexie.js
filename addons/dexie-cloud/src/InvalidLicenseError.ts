export class InvalidLicenseError extends Error {
  name = 'InvalidLicenseError';
  license?: 'expired' | 'deactivated';
  constructor(license?: 'expired' | 'deactivated') {
    super(
      license === 'expired'
        ? `License expired`
        : license === 'deactivated'
        ? `User deactivated`
        : 'Invalid license'
    );
    if (license) {
      this.license = license;
    }
  }
}
