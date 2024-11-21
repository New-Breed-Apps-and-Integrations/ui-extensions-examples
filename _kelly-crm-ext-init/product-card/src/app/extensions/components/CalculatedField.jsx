import { Button, Box, Input } from '@hubspot/ui-extensions';
import { useState, useMemo } from 'react';

export const CalculatedField = ({ input = { label: '', value: '0.00' } }) => {
  // Ensure allProducts is an array of objects with value and label
  // const productOptions = useMemo(() => {
  //   return allProducts.map((product) => ({
  //     value: product.id,
  //     label: product.properties.name,
  //   }));
  // }, [allProducts]);

  // function selectCurrentProduct(selectedOption) {
  //   console.log(`Selected product: ${JSON.stringify(selectedOption)}`);
  // }

  return (
    <>
      <Input
        label={input.label}
        value={input.value}
        readOnly={true}
        // label="First Name"
        // name="first-name"
        // tooltip="Please enter your first name"
        // description="Please enter your first name"
        // placeholder="First name"
        // required={true}
        // error={!isValid}
        // readOnly
        // validationMessage={validationMessage}
        // onChange={(value) => {
        //   setName(value);
        // }}
        // onInput={(value) => {
        //   if (value !== 'Bill') {
        //     setValidationMessage('This form only works for people named Bill');
        //     setIsValid(false);
        //   } else if (value === '') {
        //     setValidationMessage('First name is required');
        //     setIsValid(false);
        //   } else {
        //     setValidationMessage('Valid first name!');
        //     setIsValid(true);
        //   }
        // }}
        // type="password"
      />
    </>
  );
};
