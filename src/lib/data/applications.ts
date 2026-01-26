/**
 * RF Application Database
 *
 * Detailed frequency allocations for various radio services and applications.
 * Organized by category for easy lookup and visualization.
 *
 * Sources:
 * - ITU Radio Regulations
 * - ETSI standards
 * - National frequency allocation tables (BNetzA, FCC)
 *
 * NOTE: Frequency allocations may vary by region. Values shown are typical
 * for Europe/Germany unless otherwise noted.
 */

import applicationData from './applications.json';

/**
 * Application category classification
 */
export type ApplicationCategory =
  | 'broadcast'      // Rundfunk (AM, FM, DAB, DVB)
  | 'mobile'         // Mobilfunk (GSM, UMTS, LTE, 5G)
  | 'wlan'           // WLAN/WiFi
  | 'satellite'      // Satellit (GPS, TV, Internet)
  | 'radar'          // Radar (Wetter, Flug, Auto)
  | 'amateur'        // Amateurfunk
  | 'navigation'     // Navigation (GPS, LORAN, etc.)
  | 'military'       // Militärische Anwendungen
  | 'ism'            // Industrial, Scientific, Medical
  | 'pmr'            // Professional/Private Mobile Radio
  | 'maritime'       // Seefunk
  | 'aviation';      // Flugfunk

/**
 * RF Application interface
 */
export interface RFApplication {
  id: string;
  name: string;
  nameDE: string;
  minHz: number;
  maxHz: number;
  category: ApplicationCategory;
  description: string;
  descriptionDE: string;
  region?: 'worldwide' | 'europe' | 'usa' | 'asia';
  standard?: string;
  notes?: string;
}

// ============================================================================
// Load data from JSON
// ============================================================================

export const BROADCAST_APPLICATIONS: RFApplication[] = applicationData.broadcast as RFApplication[];
export const MOBILE_APPLICATIONS: RFApplication[] = applicationData.mobile as RFApplication[];
export const WLAN_APPLICATIONS: RFApplication[] = applicationData.wlan as RFApplication[];
export const SATELLITE_APPLICATIONS: RFApplication[] = applicationData.satellite as RFApplication[];
export const RADAR_APPLICATIONS: RFApplication[] = applicationData.radar as RFApplication[];
export const AMATEUR_APPLICATIONS: RFApplication[] = applicationData.amateur as RFApplication[];
export const NAVIGATION_APPLICATIONS: RFApplication[] = applicationData.navigation as RFApplication[];
export const MILITARY_APPLICATIONS: RFApplication[] = applicationData.military as RFApplication[];
export const ISM_APPLICATIONS: RFApplication[] = applicationData.ism as RFApplication[];
export const PMR_APPLICATIONS: RFApplication[] = applicationData.pmr as RFApplication[];
export const MARITIME_APPLICATIONS: RFApplication[] = applicationData.maritime as RFApplication[];
export const AVIATION_APPLICATIONS: RFApplication[] = applicationData.aviation as RFApplication[];

// ============================================================================
// Combined exports
// ============================================================================

/**
 * All RF applications combined
 */
export const ALL_APPLICATIONS: RFApplication[] = [
  ...BROADCAST_APPLICATIONS,
  ...MOBILE_APPLICATIONS,
  ...WLAN_APPLICATIONS,
  ...SATELLITE_APPLICATIONS,
  ...RADAR_APPLICATIONS,
  ...AMATEUR_APPLICATIONS,
  ...NAVIGATION_APPLICATIONS,
  ...MILITARY_APPLICATIONS,
  ...ISM_APPLICATIONS,
  ...PMR_APPLICATIONS,
  ...MARITIME_APPLICATIONS,
  ...AVIATION_APPLICATIONS,
];

/**
 * Applications grouped by category
 */
export const APPLICATIONS_BY_CATEGORY = {
  broadcast: BROADCAST_APPLICATIONS,
  mobile: MOBILE_APPLICATIONS,
  wlan: WLAN_APPLICATIONS,
  satellite: SATELLITE_APPLICATIONS,
  radar: RADAR_APPLICATIONS,
  amateur: AMATEUR_APPLICATIONS,
  navigation: NAVIGATION_APPLICATIONS,
  military: MILITARY_APPLICATIONS,
  ism: ISM_APPLICATIONS,
  pmr: PMR_APPLICATIONS,
  maritime: MARITIME_APPLICATIONS,
  aviation: AVIATION_APPLICATIONS,
} as const;

/**
 * Category display names
 */
export const CATEGORY_NAMES: Record<ApplicationCategory, { name: string; nameDE: string }> =
  applicationData.categoryNames as Record<ApplicationCategory, { name: string; nameDE: string }>;

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Find all applications that contain the given frequency
 * @param frequencyHz - The frequency in Hertz
 * @returns Array of applications that contain this frequency
 */
export function getApplicationsForFrequency(frequencyHz: number): RFApplication[] {
  if (frequencyHz <= 0 || !isFinite(frequencyHz)) {
    return [];
  }

  return ALL_APPLICATIONS.filter(
    app => frequencyHz >= app.minHz && frequencyHz <= app.maxHz
  );
}

/**
 * Find applications by category
 * @param category - The application category
 * @returns Array of applications in this category
 */
export function getApplicationsByCategory(category: ApplicationCategory): RFApplication[] {
  return APPLICATIONS_BY_CATEGORY[category] || [];
}

/**
 * Search applications by name (case-insensitive)
 * @param query - Search string
 * @returns Array of matching applications
 */
export function searchApplications(query: string): RFApplication[] {
  const lowerQuery = query.toLowerCase();
  return ALL_APPLICATIONS.filter(
    app => app.name.toLowerCase().includes(lowerQuery) ||
           app.nameDE.toLowerCase().includes(lowerQuery) ||
           app.description.toLowerCase().includes(lowerQuery) ||
           app.descriptionDE.toLowerCase().includes(lowerQuery)
  );
}
