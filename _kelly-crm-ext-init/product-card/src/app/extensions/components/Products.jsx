import { Button, Box, Select } from '@hubspot/ui-extensions';
import { useState, useMemo } from 'react';

// const products = [
//   {
//     "id": "15413323446",
//     "properties": {
//       "createdate": "2024-10-28T19:41:11.070Z",
//       "description": "1",
//       "hs_all_assigned_business_unit_ids": null,
//       "hs_lastmodifieddate": "2024-11-07T18:18:07.781Z",
//       "hs_object_id": "15413323446",
//       "name": "Mark Test",
//       "price": "1",
//       "quantity": null
//     },
//     "createdAt": "2024-10-28T19:41:11.070Z",
//     "updatedAt": "2024-11-07T18:18:07.781Z",
//     "archived": false
//   },
//   {
//     "id": "15849918339",
//     "properties": {
//       "createdate": "2024-11-08T14:59:32.789Z",
//       "description": null,
//       "hs_all_assigned_business_unit_ids": null,
//       "hs_lastmodifieddate": "2024-11-08T14:59:32.789Z",
//       "hs_object_id": "15849918339",
//       "name": "Test - SETT Product - Staffing",
//       "price": "0",
//       "quantity": null
//     },
//     "createdAt": "2024-11-08T14:59:32.789Z",
//     "updatedAt": "2024-11-08T14:59:32.789Z",
//     "archived": false
//   }
// ]

export const Products = ({ allProducts }) => {
  // Ensure allProducts is an array of objects with value and label
  const productOptions = useMemo(() => {
    return allProducts.map((product) => ({
      value: product.id,
      label: product.properties.name,
    }));
  }, [allProducts]);

  function selectCurrentProduct(selectedOption) {
    console.log(`Selected product: ${JSON.stringify(selectedOption)}`);
  }

  return (
    <Box>
      <Select
        label="Products"
        name="products"
        description="Please select products"
        required={true}
        onChange={selectCurrentProduct}
        options={productOptions}
      />
    </Box>
  );
};
