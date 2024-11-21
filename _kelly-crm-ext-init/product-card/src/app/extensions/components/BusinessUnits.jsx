import { Button, Box, Select } from '@hubspot/ui-extensions';
import { useState, useMemo } from 'react';

// const businessUnitsSampleData = [
//   {
//     id: '1253464',
//     name: 'Kelly P&I',
//     logoMetadata: null,
//   },
// ];

export const BusinessUnits = ({ allBusinessUnits }) => {
  // Generate memoized select options
  const businessUnits = useMemo(() => {
    return allBusinessUnits.map((businessUnit) => ({
      value: businessUnit.id,
      label: businessUnit.name,
    }));
  }, [allBusinessUnits]);

  function selectCurrentBusinessUnit(selectedOption) {
    console.log(`Selected business unit: ${JSON.stringify(selectedOption)}`);
  }

  return (
    <Box flex={'auto'}>
      <Select
        label="Business Units"
        name="businessUnits"
        description="Please select business units"
        required={true}
        onChange={selectCurrentBusinessUnit}
        options={businessUnits}
      />
    </Box>
  );
};
