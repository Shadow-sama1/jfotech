declare module "naija-state-local-government" {
  const NaijaStates: {
    all(): { state: string; lgas: string[] }[];
    states(): string[];
    lgas(state: string): { state: string; lgas: string[] } | undefined;
  };

  export default NaijaStates;
}