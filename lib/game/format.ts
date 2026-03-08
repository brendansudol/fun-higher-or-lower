import type { CategoryDefinition, FormatterId } from './types';

const compactNumber = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const compactCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const decimalOne = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

export function formatByFormatter(value: number, formatter: FormatterId): string {
  switch (formatter) {
    case 'compact-number':
      return compactNumber.format(value);
    case 'compact-currency':
    case 'currency-per-capita':
      return compactCurrency.format(value);
    case 'percent-1':
      return `${decimalOne.format(value)}%`;
    case 'decimal-1':
      return decimalOne.format(value);
    case 'sq-km':
      return `${compactNumber.format(value)} sq km`;
    default:
      return decimalOne.format(value);
  }
}

export function formatMetricValue(value: number, category: CategoryDefinition): string {
  const formatted = formatByFormatter(value, category.formatter);

  if (category.id === 'life_expectancy') {
    return `${formatted} years`;
  }

  if (category.id === 'co2_per_capita') {
    return `${formatted} t`;
  }

  return formatted;
}
