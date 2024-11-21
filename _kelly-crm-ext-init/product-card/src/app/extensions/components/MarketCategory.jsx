import { Button, Box, Select } from '@hubspot/ui-extensions';
import { useState, useMemo } from 'react';

// const marketCategoriesSampleData = [
//   {
//     id: 1,
//     name: 'Market Category 1',
//     value: 1,
//   },
//   {
//     id: 2,
//     name: 'Market Category 2',
//     value: 2,
//   },
// ];

export const MarketCategory = ({ allMarketCategories }) => {
  // Generate memoized select options
  const marketCategories = useMemo(() => {
    return allMarketCategories.map((marketCategory) => ({
      value: marketCategory.id,
      label: marketCategory.name,
    }));
  }, [allMarketCategories]);

  function selectCurrentMarketCategory(selectedOption) {
    console.log(`Selected business unit: ${JSON.stringify(selectedOption)}`);
  }

  return (
    <Box flex={'auto'} alignSelf={'stretch'}>
      <Select
        label="Market Category"
        name="marketCategory"
        description="Please select market category"
        required={true}
        onChange={selectCurrentMarketCategory}
        options={marketCategories}
      />
    </Box>
  );
};
