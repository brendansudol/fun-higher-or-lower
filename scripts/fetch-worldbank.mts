export interface WorldBankValue {
  countryiso3code: string;
  date: string;
  value: number | null;
}

export interface WorldBankLatestValue {
  value: number;
  year: number;
}

export async function fetchWorldBankLatestValues(indicatorId: string): Promise<Record<string, WorldBankLatestValue>> {
  const url = `https://api.worldbank.org/v2/country/all/indicator/${indicatorId}?format=json&per_page=20000`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch World Bank indicator ${indicatorId}: ${response.status}`);
  }

  const payload = (await response.json()) as [unknown, WorldBankValue[]];
  const rows = payload[1] ?? [];
  const latestByCountry: Record<string, WorldBankLatestValue> = {};

  for (const row of rows) {
    if (!row.countryiso3code || row.countryiso3code.length !== 3 || row.value === null) {
      continue;
    }

    const year = Number(row.date);
    const existing = latestByCountry[row.countryiso3code];

    if (!existing || year > existing.year) {
      latestByCountry[row.countryiso3code] = {
        value: Number(row.value),
        year,
      };
    }
  }

  return latestByCountry;
}
