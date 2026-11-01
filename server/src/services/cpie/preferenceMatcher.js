/**
 * PlaceWise Career Path Intelligence Engine (CPIE)
 * Module: Preference Matcher
 * 
 * Compares student's selected career preference mode with role's preference group.
 * Note: Preference NEVER alters eligibility. It only affects ranking & discovery partitioning.
 */

export const PREFERENCE_MODES = {
  TECHNICAL: 'TECHNICAL',
  NON_TECHNICAL: 'NON_TECHNICAL',
  BOTH: 'BOTH',
  OPEN_TO_ALL: 'OPEN_TO_ALL'
};

export const PREFERENCE_GROUPS = {
  TECHNICAL: 'TECHNICAL',
  NON_TECHNICAL: 'NON_TECHNICAL'
};

/**
 * Computes preference compatibility score P in [0, 100].
 */
export function calculatePreferenceScore(preferenceMode, rolePreferenceGroup) {
  const mode = (preferenceMode || PREFERENCE_MODES.OPEN_TO_ALL).toUpperCase();
  const group = (rolePreferenceGroup || PREFERENCE_GROUPS.TECHNICAL).toUpperCase();

  switch (mode) {
    case PREFERENCE_MODES.BOTH:
    case PREFERENCE_MODES.OPEN_TO_ALL:
      return 100;

    case PREFERENCE_MODES.TECHNICAL:
      return group === PREFERENCE_GROUPS.TECHNICAL ? 100 : 30;

    case PREFERENCE_MODES.NON_TECHNICAL:
      return group === PREFERENCE_GROUPS.NON_TECHNICAL ? 100 : 30;

    default:
      return 100;
  }
}

/**
 * Determines whether a role falls under the student's primary preference filter.
 * Used for partitioning into:
 *  - Section A: RECOMMENDED FOR YOU
 *  - Section B: EXPLORE OTHER OPPORTUNITIES
 */
export function isWithinPreference(preferenceMode, rolePreferenceGroup) {
  const mode = (preferenceMode || PREFERENCE_MODES.OPEN_TO_ALL).toUpperCase();
  const group = (rolePreferenceGroup || PREFERENCE_GROUPS.TECHNICAL).toUpperCase();

  if (mode === PREFERENCE_MODES.BOTH || mode === PREFERENCE_MODES.OPEN_TO_ALL) {
    return true;
  }
  if (mode === PREFERENCE_MODES.TECHNICAL) {
    return group === PREFERENCE_GROUPS.TECHNICAL;
  }
  if (mode === PREFERENCE_MODES.NON_TECHNICAL) {
    return group === PREFERENCE_GROUPS.NON_TECHNICAL;
  }
  return true;
}
