import NaijaStates from "naija-state-local-government";

export const nigeriaLocations = Object.fromEntries(
  NaijaStates.all().map(({ state, lgas }) => [state, lgas]),
);

export const nigeriaStates = Object.keys(nigeriaLocations);

export function isValidNigerianLocation(state: string, lga: string) {
  return Boolean(nigeriaLocations[state]?.includes(lga));
}