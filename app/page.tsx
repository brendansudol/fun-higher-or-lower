import { GameShell } from '@/components/game-shell';
import categories from '@/data/generated/categories.world.json';
import countries from '@/data/generated/countries.world.json';
import fallbackRounds from '@/data/generated/fallback-rounds.world.json';
import type { CategoryDefinition, CountryRecord, FallbackRoundDefinition } from '@/lib/game/types';

export default function Page() {
  return (
    <GameShell
      categories={categories as CategoryDefinition[]}
      countries={countries as CountryRecord[]}
      fallbackRounds={fallbackRounds as FallbackRoundDefinition[]}
    />
  );
}
