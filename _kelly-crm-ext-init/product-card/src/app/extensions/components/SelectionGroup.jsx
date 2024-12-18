import { Flex } from '@hubspot/ui-extensions';
import { Box } from '@hubspot/ui-extensions';
import { Select } from '@hubspot/ui-extensions';
import { useMemo } from 'react';
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
      />
    </Box>
  </Flex>
);

const Products = ({ allProducts, onInputChange, setSelectedProduct, selectedProduct, selectedBusinessUnit, selectedServiceCategory }) => {
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((product) => {
        const matchesBusinessUnit = selectedBusinessUnit ? product.properties.business_unit === selectedBusinessUnit : true;
        const matchesServiceCategory = selectedServiceCategory ? product.properties.service_category === selectedServiceCategory : true;

        return matchesBusinessUnit && matchesServiceCategory;
      })
      .map((product) => ({
        value: product.id,
        label: product.properties.name,
      }));
  }, [allProducts, selectedBusinessUnit, selectedServiceCategory]);

  const selectCurrentProduct = (value) => {
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
      value={selectedProduct || ''} // Reflect selected product
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
      value={selectedBusinessUnit || ''}
    />
  );
};

const ServiceCategory = ({ allServiceCategories, onInputChange, setSelectedServiceCategory, selectedServiceCategory }) => {
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
