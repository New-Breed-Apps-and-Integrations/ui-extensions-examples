import { Flex } from '@hubspot/ui-extensions';
import { Box } from '@hubspot/ui-extensions';
import { Select } from '@hubspot/ui-extensions';
import { useMemo, useState, useEffect } from 'react';
import React from 'react';

const FLEX_GAP = 'small';

export const SelectionGroup = ({
  allBusinessUnits,
  allServiceCategories,
  allProducts,
  onInputChange,
  selectedBusinessUnit,
  selectedServiceCategory,
  selectedProduct,
  usersFirstBusinessUnit,
  setSelectedBusinessUnit,
  setSelectedProduct,
  setSelectedServiceCategory,
}) => (
  <Flex direction="column" gap={FLEX_GAP}>
    <Flex direction="row" gap={FLEX_GAP} justify="between" align="stretch" alignSelf="stretch" wrap="nowrap">
      <Box flex={'auto'}>
        <BusinessUnits
          allBusinessUnits={allBusinessUnits}
          onInputChange={onInputChange}
          selectedBusinessUnit={selectedBusinessUnit}
          usersFirstBusinessUnit={usersFirstBusinessUnit}
          setSelectedBusinessUnit={setSelectedBusinessUnit}
        />
      </Box>
      <Box flex={'auto'}>
        <ServiceCategory
          allServiceCategories={allServiceCategories}
          onInputChange={onInputChange}
          selectedServiceCategory={selectedServiceCategory}
          setSelectedServiceCategory={setSelectedServiceCategory}
        />
      </Box>
    </Flex>

    <Box>
      <Products
        allProducts={allProducts}
        onInputChange={onInputChange}
        selectedProduct={selectedProduct}
        selectedBusinessUnit={selectedBusinessUnit}
        selectedServiceCategory={selectedServiceCategory}
      />
    </Box>
  </Flex>
);

const Products = ({ allProducts, onInputChange, selectedProduct, selectedBusinessUnit, selectedServiceCategory }) => {
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((product) => {
        const matchesBusinessUnit =
          selectedBusinessUnit === 'All Units' || !selectedBusinessUnit
            ? true
            : product.properties.business_unit === selectedBusinessUnit;

        const matchesServiceCategory =
          selectedServiceCategory === 'All' || !selectedServiceCategory
            ? true
            : product.properties.service_category === selectedServiceCategory;

        return matchesBusinessUnit && matchesServiceCategory;
      })
      .map((product) => ({
        value: product.id,
        label: product.properties.name,
      }));
  }, [allProducts, selectedBusinessUnit, selectedServiceCategory]);

  const selectCurrentProduct = (value) => {
    onInputChange('product', value);
  };

  return (
    <Select
      label="Products"
      name="products"
      description="Please select a product"
      required
      onChange={selectCurrentProduct}
      options={filteredProducts}
      value={selectedProduct || ''}
    />
  );
};

const BusinessUnits = ({ allBusinessUnits, onInputChange, selectedBusinessUnit, setSelectedBusinessUnit }) => {
  const businessUnits = useMemo(() => {
    return allBusinessUnits.map((businessUnit) => ({
      value: businessUnit.name,
      label: businessUnit.name,
    }));
  }, [allBusinessUnits]);

  const selectCurrentBusinessUnit = (value) => {
    setSelectedBusinessUnit(value);
    onInputChange('businessUnit', value);
  };

  // default using setSelectedBusinessUnit
  useEffect(() => {
    console.log('selectedBusinessUnit:', selectedBusinessUnit);
    if (!selectedBusinessUnit) {
      setSelectedBusinessUnit(selectedBusinessUnit);
    }
  }, [selectedBusinessUnit]);

  return (
    <Select
      label="Business Units (required)"
      name="businessUnits"
      description="Please select a business unit"
      required
      onChange={selectCurrentBusinessUnit}
      options={businessUnits}
      value={selectedBusinessUnit}
    />
  );
};

const ServiceCategory = ({
  allServiceCategories,
  onInputChange,
  setSelectedServiceCategory,
  selectedServiceCategory,
}) => {
  const serviceCategories = useMemo(() => {
    return allServiceCategories.map((serviceCategory) => ({
      value: serviceCategory.value,
      label: serviceCategory.label,
    }));
  }, [allServiceCategories]);

  const selectCurrentServiceCategory = (value) => {
    setSelectedServiceCategory(value);
    onInputChange('serviceCategory', value);
  };

  return (
    <Select
      label="Service Category (optional)"
      name="serviceCategory"
      description="Please select a service category"
      onChange={selectCurrentServiceCategory}
      options={serviceCategories}
      value={selectedServiceCategory || ''}
    />
  );
};
