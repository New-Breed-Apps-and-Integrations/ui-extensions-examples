import { Flex } from '@hubspot/ui-extensions';
import { Box } from '@hubspot/ui-extensions';
import { Select } from '@hubspot/ui-extensions';
import { useMemo, useState } from 'react';
import React from 'react';

const FLEX_GAP = 'small';

export const SelectionGroup = ({
  allBusinessUnits,
  allServiceCategories,
  allProducts,
  onInputChange,
  setSelectedBusinessUnit,
  setSelectedServiceCategory,
  setSelectedProduct,
  selectedBusinessUnit,
  selectedServiceCategory,
  selectedProduct,
  dealStartDate,
}) => (
  <Flex direction="column" gap={FLEX_GAP}>
    <Flex direction="row" gap={FLEX_GAP} justify="between" align="stretch" alignSelf="stretch" wrap="nowrap">
      <Box flex={'auto'}>
        <BusinessUnits
          allBusinessUnits={allBusinessUnits}
          onInputChange={onInputChange}
          setSelectedBusinessUnit={setSelectedBusinessUnit}
          selectedBusinessUnit={selectedBusinessUnit}
        />
      </Box>
      <Box flex={'auto'}>
        <ServiceCategory
          allServiceCategories={allServiceCategories}
          onInputChange={onInputChange}
          setSelectedServiceCategory={setSelectedServiceCategory}
          selectedServiceCategory={selectedServiceCategory}
        />
      </Box>
    </Flex>

    <Box>
      <Products
        allProducts={allProducts}
        onInputChange={onInputChange}
        setSelectedProduct={setSelectedProduct}
        selectedProduct={selectedProduct}
        selectedBusinessUnit={selectedBusinessUnit}
        selectedServiceCategory={selectedServiceCategory}
        setSelectedBusinessUnit={setSelectedBusinessUnit}
        setSelectedServiceCategory={setSelectedServiceCategory}
      />
    </Box>
  </Flex>
);

const Products = ({
  allProducts,
  onInputChange,
  setSelectedProduct,
  setSelectedBusinessUnit,
  setSelectedServiceCategory,
  selectedProduct,
  selectedBusinessUnit,
  selectedServiceCategory,
}) => {
  const filteredProducts = useMemo(() => {
    const products = allProducts
      .filter((product) => {
        const matchesBusinessUnit =
          !selectedBusinessUnit || selectedBusinessUnit === 'All Units'
            ? true
            : product.properties.business_unit === selectedBusinessUnit;

        const matchesServiceCategory = selectedServiceCategory
          ? product.properties.service_category === selectedServiceCategory
          : true;

        return matchesBusinessUnit && matchesServiceCategory;
      })
      .map((product) => ({
        value: product.id,
        label: product.properties.name,
      }));

    return products;
  }, [allProducts, selectedBusinessUnit, selectedServiceCategory]);

  const selectCurrentProduct = (value) => {
    // Find the selected product details
    const selected = allProducts.find((product) => product.id === value);

    if (selected) {
      // Update business unit and service category based on the selected product
      const { business_unit, service_category } = selected.properties;

      setSelectedBusinessUnit(business_unit);
      onInputChange('businessUnit', business_unit);

      setSelectedServiceCategory(service_category);
      onInputChange('serviceCategory', service_category);
    }

    // Update the selected product
    setSelectedProduct(value);
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

const BusinessUnits = ({ allBusinessUnits, onInputChange, setSelectedBusinessUnit, selectedBusinessUnit }) => {
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

  return (
    <Select
      label="Business Units (required)"
      name="businessUnits"
      description="Please select a business unit"
      required
      onChange={selectCurrentBusinessUnit}
      options={businessUnits}
      value={selectedBusinessUnit || 'All Units'}
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
