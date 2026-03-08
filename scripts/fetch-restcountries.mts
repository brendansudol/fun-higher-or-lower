const REST_COUNTRIES_URL =
  'https://restcountries.com/v3.1/all?fields=cca2,cca3,name,region,subregion,flag,independent,unMember';

export interface RestCountryRecord {
  cca2: string;
  cca3: string;
  name: {
    common: string;
  };
  region?: string;
  subregion?: string;
  flag?: string;
  independent?: boolean;
  unMember?: boolean;
}

export async function fetchRestCountries(): Promise<RestCountryRecord[]> {
  const response = await fetch(REST_COUNTRIES_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch restcountries metadata: ${response.status}`);
  }

  return (await response.json()) as RestCountryRecord[];
}
