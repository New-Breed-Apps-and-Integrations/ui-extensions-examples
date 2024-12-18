import { Divider } from '@hubspot/ui-extensions';
import { Flex } from '@hubspot/ui-extensions';
import { Button } from '@hubspot/ui-extensions';
import { Tile } from '@hubspot/ui-extensions';
import { Box } from '@hubspot/ui-extensions';
import { Input } from '@hubspot/ui-extensions';
import { Select } from '@hubspot/ui-extensions';
import { Text } from '@hubspot/ui-extensions';
import { Form } from '@hubspot/ui-extensions';
import { LoadingSpinner } from '@hubspot/ui-extensions';
import { Link } from '@hubspot/ui-extensions';
import { hubspot } from '@hubspot/ui-extensions';

import { useState } from 'react';
import { useEffect } from 'react';
import { useMemo } from 'react';
import React from 'react';

import { RevenueAndCalculatedFields } from './components/RevenueAndCalculatedFields';
import { SelectionGroup } from './components/SelectionGroup';

// [x] Rolling up the line item total to the deal amount
// [ ] Ensure that the currency symbol on the line items match the deal
// [x] Remove the extra headers on the collapsed line items
// [ ] Ensure that the filters (business units and service category) are working correctly
// [x] Do we have the fields in the right order with the right naming conventions?

// import { Products } from './components/Products';
// import { BusinessUnits } from './components/BusinessUnits';
// import { MarketCategory } from './components/MarketCategory';
// import { CalculatedFields } from './components/old/CalculatedFields';
// import { ProductForm } from './components/ProductForm';
// import { LineItem } from './components/old/LineItem';
// import { ReadOnlyInput } from './components/old/ReadOnlyInput';
// import { ReadOnlyInputMoney } from './components/old/ReadOnlyInputMoney';
// import { CalculatedField } from './components/CalculatedField';

// direction	'row' (default) | 'column'
// justify	'start' (default) | 'center' | 'end' | 'around' | 'between'
// align	'start' | 'center' | 'end' | 'baseline' | 'stretch' (default)
// alignSelf	'start' | 'center' | 'end' | 'baseline' | 'stretch'

// TODO:
// - make calculated fields calculate
// - pull in the signed date of the contract for calculated fields
// - form starts hidden, show when line item or 'add line item' is selected
// - add drawers/rows for each exisinting line item at the top of the card, append a row with 'Add Line Item'
// - make the 'Save' button create a new line item
// - figure out how to refresh the page/data

// Define the extension to be run within the Hubspot CRM
hubspot.extend(({ runServerlessFunction, context, actions }) => (
  <ProductCard runFunction={runServerlessFunction} context={context} actions={actions} />
));

const ProductCard = ({ runFunction, context, actions }) => {
  // const refreshObjectProperties = actions.refreshObjectProperties;
  const reloadPage = actions.reloadPage;

  const [loading, setLoading] = useState(true);
  const [lineItems, setLineItems] = useState([]);
  const [allProducts, setAllProducts] = useState(null);
  const [allBusinessUnits, setAllBusinessUnits] = useState(null);
  const [allServiceCategories, setAllServiceCategories] = useState(null);
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState('');
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [dealStartDate, setDealStartDate] = useState(new Date().toISOString());

  const [inputs, setInputs] = useState({
    annualRevenueAmount: 0,
    initialYearAmountOverride: 0,
    gpFeePercent: 0,
    gpFeeDollarAmount: 0,
    initialYearGpOverride: 0,
    markupPercent: 0,
    initialYearGpFee: 0,
    initialYearAmount: 0,
    businessUnit: '',
    serviceCategory: '',
    product: '',
    country: '',
  });

  const handleInputChange = (name, value) => {
    setInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value || 0,
    }));
  };

  const clearLineItems = () => {
    runFunction({
      name: 'clearLineItems',
      propertiesToSend: ['hs_object_id'],
    }).then(() => {
      reloadPage();
    });
  };

  const getData = () => {
    return runFunction({
      name: 'getData',
      propertiesToSend: ['hs_object_id'],
      parameters: {
        uiContext: context,
      },
    });
  };

  const handleFormSubmit = (formData) => {
    const updatedFormData = {
      ...formData,
      businessUnit: selectedBusinessUnit,
      serviceCategory: selectedServiceCategory,
      product: selectedProduct,
    };

    console.log(`updatedFormData: ${JSON.stringify(updatedFormData, null, 2)}`);
    runFunction({
      name: 'upsertLineItem',
      parameters: { formData: updatedFormData },
      propertiesToSend: ['hs_object_id'],
    }).then((wrappedResponse) => {
      const { newLineItem } = wrappedResponse.response;
      console.log(`newLineItem: ${JSON.stringify(newLineItem, null, 2)}`);
      reloadPage();
    });
  };
  useEffect(() => {
    console.log('Inputs updated:', inputs);
  }, [inputs]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const wrappedResponse = await getData();
        const response = wrappedResponse.response;
        // console.log(`response: ${JSON.stringify(response, null, 2)}`);

        setLineItems(response.lineItems);
        console.log(`response.lineItems: ${JSON.stringify(response.lineItems, null, 2)}`);
        setDealStartDate(response.dealStartDate);
        setAllProducts(response.allProducts);
        // console.log(`response.allProducts: ${JSON.stringify(response.allProducts, null, 2)}`);
        setAllBusinessUnits(response.allBusinessUnits);
        setAllServiceCategories(response.allServiceCategories);
      } catch (error) {
        console.error('Error fetching data from serverless function:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Flex direction="column" gap={FLEX_GAP} style={{ padding: '0px', width: '100%' }}>
      <Drawers
        lineItems={lineItems}
        allBusinessUnits={allBusinessUnits}
        allServiceCategories={allServiceCategories}
        allProducts={allProducts}
        inputs={inputs}
        handleFormSubmit={handleFormSubmit}
        handleInputChange={handleInputChange}
        setSelectedBusinessUnit={setSelectedBusinessUnit}
        setSelectedServiceCategory={setSelectedServiceCategory}
        setSelectedProduct={setSelectedProduct}
        clearLineItems={clearLineItems}
        selectedBusinessUnit={selectedBusinessUnit}
        selectedServiceCategory={selectedServiceCategory}
        selectedProduct={selectedProduct}
        dealStartDate={dealStartDate}
      />
    </Flex>
  );
};

export default ProductCard;

const Drawers = ({
  lineItems,
  allBusinessUnits,
  allServiceCategories,
  allProducts,
  inputs,
  handleFormSubmit,
  handleInputChange,
  setSelectedBusinessUnit,
  setSelectedServiceCategory,
  setSelectedProduct,
  clearLineItems,
  selectedBusinessUnit,
  selectedServiceCategory,
  selectedProduct,
  dealStartDate,
}) => {
  const [openIndex, setOpenIndex] = useState(null);
  const [selectedLineItem, setSelectedLineItem] = useState(null);

  const toggleOpen = (index) => {
    console.log(`Toggling index: ${index}`);
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
    setSelectedLineItem(index !== null ? lineItems[index] : null);
  };

  const prepopulatedInputs = selectedLineItem || inputs;

  return (
    <>
      <Flex direction="column" gap={'flush'}>
        {lineItems.map((item, index) => (
          <LineItemWithForm
            key={index}
            item={item}
            index={index}
            allBusinessUnits={allBusinessUnits}
            allServiceCategories={allServiceCategories}
            allProducts={allProducts}
            handleInputChange={handleInputChange}
            inputs={prepopulatedInputs}
            handleFormSubmit={handleFormSubmit}
            isOpen={openIndex === index}
            toggleOpen={toggleOpen}
            selectedLineItem={selectedLineItem}
            setSelectedBusinessUnit={setSelectedBusinessUnit}
            selectedBusinessUnit={selectedBusinessUnit}
            setSelectedServiceCategory={setSelectedServiceCategory}
            selectedServiceCategory={selectedServiceCategory}
            setSelectedProduct={setSelectedProduct}
            selectedProduct={selectedProduct}
            dealStartDate={dealStartDate}
          />
        ))}
        <Flex direction="column" gap={'flush'}>
          <Button onClick={() => toggleOpen('add')}>
            {openIndex === 'add' ? 'Cancel New Line Item' : 'Add a New Line Item'}
          </Button>
          {openIndex === 'add' && (
            <Flex direction="column" gap={'flush'}>
              <Divider distance="small" />
              <ProductForm
                allBusinessUnits={allBusinessUnits}
                allServiceCategories={allServiceCategories}
                allProducts={allProducts}
                onInputChange={handleInputChange}
                inputs={prepopulatedInputs}
                onFormSubmit={handleFormSubmit}
                setSelectedBusinessUnit={setSelectedBusinessUnit}
                setSelectedServiceCategory={setSelectedServiceCategory}
                setSelectedProduct={setSelectedProduct}
                selectedBusinessUnit={prepopulatedInputs.businessUnit}
                selectedServiceCategory={prepopulatedInputs.serviceCategory}
                selectedProduct={prepopulatedInputs.product}
                dealStartDate={dealStartDate}
              />
            </Flex>
          )}
        </Flex>
        {/* <Button>**debug** current line_item count: {lineItems.length} **debug**</Button> */}
        <Divider distance="large" />

        <Button variant="destructive" onClick={clearLineItems}>
          Delete All Line Items
        </Button>
      </Flex>
    </>
  );
};

const FLEX_GAP = 'small'; // 'flush' (default) | 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'

const ButtonGroup = () => (
  <Box flex={'auto'} alignSelf="center" padding="20px">
    <Button type="submit">Save</Button>
  </Box>
);

function doOnSubmit(e, inputs, onFormSubmit) {
  console.log('inputs in onSubmit', JSON.stringify(inputs, null, 2));
  const formData = {
    ...inputs,
  };
  onFormSubmit(formData);
}

const ProductForm = ({
  allBusinessUnits,
  allServiceCategories,
  allProducts,
  onInputChange,
  inputs,
  onFormSubmit,
  setSelectedBusinessUnit,
  setSelectedServiceCategory,
  setSelectedProduct,
  selectedBusinessUnit,
  selectedServiceCategory,
  selectedProduct,
  dealStartDate,
}) => {
  const [localInputs, setLocalInputs] = useState(inputs);

  useEffect(() => {
    setLocalInputs(inputs); // Sync external updates
  }, [inputs]);

  const handleInputChange = (name, value) => {
    setLocalInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
    onInputChange(name, value); // Pass to parent
  };

  const handleCalculatedFieldsChange = (calculatedFields) => {
    Object.entries(calculatedFields).forEach(([key, value]) => {
      handleInputChange(key, value);
    });
  };

  return (
    <Form onSubmit={(e) => doOnSubmit(e, localInputs, onFormSubmit)}>
      <Flex direction="column" gap={'flush'} flex={'auto'}>
        {/* <Flex direction="row">
          <Text variant="heading">Select a Product to begin</Text>
        </Flex> */}

        <Flex direction="column" gap={FLEX_GAP}>
          <SelectionGroup
            allBusinessUnits={allBusinessUnits}
            allServiceCategories={allServiceCategories}
            allProducts={allProducts}
            onInputChange={onInputChange}
            onFormSubmit={onFormSubmit}
            setSelectedBusinessUnit={setSelectedBusinessUnit}
            setSelectedServiceCategory={setSelectedServiceCategory}
            setSelectedProduct={setSelectedProduct}
            selectedBusinessUnit={inputs.businessUnit || selectedBusinessUnit}
            selectedServiceCategory={inputs.serviceCategory || selectedServiceCategory}
            selectedProduct={inputs.product || selectedProduct}
            dealStartDate={dealStartDate}
          />
          <Divider distance="small" />
          <RevenueAndCalculatedFields
            inputs={inputs}
            onInputChange={onInputChange}
            onFormSubmit={onFormSubmit}
            dealStartDate={dealStartDate}
          />
          <Divider distance="small" />
        </Flex>
        <Flex align="end" flex={'2'} direction="row" justify="center">
          <Box flex={'1'}>
            <ButtonGroup />
          </Box>
        </Flex>
      </Flex>
    </Form>
  );
};

const LineItemWithForm = ({
  item,
  index,
  allBusinessUnits,
  allServiceCategories,
  allProducts,
  handleInputChange,
  handleFormSubmit,
  isOpen,
  toggleOpen,
  setSelectedBusinessUnit,
  setSelectedServiceCategory,
  setSelectedProduct,
  dealStartDate,
}) => {
  const [prepopulatedInputs, setPrepopulatedInputs] = useState({});

  useEffect(() => {
    if (isOpen && item) {
      setPrepopulatedInputs({
        annualRevenueAmount: item.annual_revenue_amount || 0,
        gpFeePercent: item.gp_fee_percent || 0,
        gpFeeDollarAmount: item.gp_fee__ || 0,
        initialYearAmountOverride: item.initial_year_amount_override || 0,
        initialYearGpOverride: item.initial_year_gp_override || 0,
        markupPercent: item.markup_percent || 0,
        businessUnit: item.business_unit || '',
        serviceCategory: item.service_category || '',
        product: item.product_id || '',
        country: item.country || '',
      });

      // Sync dropdown state
      setSelectedBusinessUnit(item.business_unit || '');
      setSelectedServiceCategory(item.service_category || '');
      setSelectedProduct(item.product_id || '');
    }
  }, [isOpen, item]);

  return (
    <Flex direction="row" gap={'flush'} align="center">
      <Flex direction="column" gap={'flush'} flex="1">
        <Link onClick={() => toggleOpen(index)}>
          <LineItem key={index} item={item} />
        </Link>
        {isOpen && (
          <>
            <Divider distance="small" />
            <ProductForm
              allBusinessUnits={allBusinessUnits}
              allServiceCategories={allServiceCategories}
              allProducts={allProducts}
              onInputChange={handleInputChange}
              inputs={prepopulatedInputs}
              onFormSubmit={handleFormSubmit}
              setSelectedBusinessUnit={setSelectedBusinessUnit}
              setSelectedServiceCategory={setSelectedServiceCategory}
              setSelectedProduct={setSelectedProduct}
              selectedBusinessUnit={prepopulatedInputs.businessUnit}
              selectedServiceCategory={prepopulatedInputs.serviceCategory}
              selectedProduct={prepopulatedInputs.product}
              dealStartDate={dealStartDate}
            />
          </>
        )}
      </Flex>
    </Flex>
  );
};

// Product Name | Annual Revenue Amount | GP Fee Percent | GP Fee Amount

const lineItemDataPoints = [
  { label: 'Product Name', hs_internal_name: 'name' },
  { label: 'Annual Revenue Amount', hs_internal_name: 'annual_revenue_amount' },
  { label: 'GP Fee Percent', hs_internal_name: 'gp_fee_percent' },
  { label: 'GP Fee Amount', hs_internal_name: 'gp_fee__' },
];

const LineItemRowContents = ({ dataPoint, item }) => (
  <Flex direction="column" gap="xs" align="left" justify="end" wrap="wrap">
    <Text variant="microcopy" format={{ fontWeight: 'bold' }}>
      {dataPoint.label}:
    </Text>
    <Text format={{ textAlign: 'right' }} truncate={true} variant="microcopy">
      {item[dataPoint.hs_internal_name] || 'N/A'}
    </Text>
  </Flex>
);

const LineItem = ({ item }) => (
  <Tile onClick={() => console.log('clicked')} flush={false} compact={true}>
    <Flex direction="row" gap="xs" wrap="nowrap">
      {lineItemDataPoints.map((dataPoint) => (
        <LineItemRowContents dataPoint={dataPoint} item={item} />
      ))}
    </Flex>
  </Tile>
);
