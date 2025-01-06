import { Divider } from '@hubspot/ui-extensions';
import { Flex } from '@hubspot/ui-extensions';
import { Button } from '@hubspot/ui-extensions';
import { Tile } from '@hubspot/ui-extensions';
import { Box } from '@hubspot/ui-extensions';
import { Text } from '@hubspot/ui-extensions';
import { Form } from '@hubspot/ui-extensions';
import { LoadingSpinner } from '@hubspot/ui-extensions';
import { Link } from '@hubspot/ui-extensions';
import { hubspot } from '@hubspot/ui-extensions';

import { useState } from 'react';
import { useEffect } from 'react';
import React from 'react';

import { RevenueAndCalculatedFields } from './components/RevenueAndCalculatedFields';
import { SelectionGroup } from './components/SelectionGroup';
import { formatCurrency, formatPercent } from './helpers/formatHelper';

// [x] Edit the deal property the "First Year Amount" to be "Initial Year Amount"
// [x] Edit the deal property "First Year GP/Fee" to be "Initial Year GP Fee"
// [ ] The deal property GP / Fee $ should be a calculated property defined as the sum of the GP Fee amount on each individual line item
// [ ] The deal property GP / Fee % should be a calculated field defined as the deal amount / GP Fee $
// [ ] The deal property "Initial Year Amount" should be a calculated field defined as the sum of the "Initial Year Amount Override" field on each individual line item, or if that value is blank, the sum of the "Initial Year Amount" field on each individual line item.
// [ ] The deal property Initial Year GP/Fee  should be a calculated field defined as the sum of the "Initial Year GP Override" field on each individual line item, or if that value is blank, the sum of the "Initial Year GP Fee" field on each individual line item.
// [x] A line item's country property should default to the country associated with the country property of the company associated with the deal.  When edited, this field would not revert back
// [ ] Ensure that we are consistent across fields containing money values to use two (hundredth) decimal places
// [ ] Ensure that we are consistent across fields containing percentages to use two (hundredth) decimal places
// [ ] Update the padding on the collapsed line items with a focus of maximizing visibility to the product name
// [ ] Default to users business unit

// how do we validate deal start date?
// do we validate any of the fields?
// why doesn't formatStyle work for inputs
// need to clear form data when canceling a new line item

// direction	'row' (default) | 'column'
// justify	'start' (default) | 'center' | 'end' | 'around' | 'between'
// align	'start' | 'center' | 'end' | 'baseline' | 'stretch' (default)
// alignSelf	'start' | 'center' | 'end' | 'baseline' | 'stretch'

// Define the extension to be run within the Hubspot CRM
hubspot.extend(({ runServerlessFunction, context, actions }) => (
  <ProductCard runFunction={runServerlessFunction} context={context} actions={actions} />
));

const ProductCard = ({ runFunction, context, actions }) => {
  // const refreshObjectProperties = actions.refreshObjectProperties;
  const reloadPage = actions.reloadPage;
  const showAlert = actions.addAlert;

  const [loading, setLoading] = useState(true);
  const [lineItems, setLineItems] = useState([]);
  const [allProducts, setAllProducts] = useState(null);
  const [allBusinessUnits, setAllBusinessUnits] = useState(null);
  const [allServiceCategories, setAllServiceCategories] = useState(null);
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState('All Units');
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [dealStartDate, setDealStartDate] = useState(new Date().toISOString());
  const [dealCurrencyCode, setDealCurrencyCode] = useState('');
  const [dealCompanyCountry, setDealCompanyCountry] = useState('');
  const [usersFirstBusinessUnit, setUsersFirstBusinessUnit] = useState('');

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
    hsObjectId: '',
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
    console.log('getData called context:', context);

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

    setLineItems((prevLineItems) =>
      prevLineItems.map(
        (item) =>
          item.hsObjectId === formData.hsObjectId // Match the specific line item
            ? { ...item, ...formData } // Update the specific line item
            : item // Keep the others unchanged
      )
    );

    runFunction({
      name: 'upsertLineItem',
      parameters: { formData: updatedFormData },
      propertiesToSend: ['hs_object_id'],
    }).then((wrappedResponse) => {
      const { newLineItem, error } = wrappedResponse.response;
      if (error) {
        console.log('error:', error);
        showAlert({
          title: 'Error: Line Item Not Saved',
          message: error,
          type: 'danger',
        });
      } else {
        console.log('newLineItem:', newLineItem);
        reloadPage();
      }
    });
  };
  useEffect(() => {
    console.log('Inputs updated:', inputs);
  }, [inputs]);

  useEffect(() => {
    // Trigger an update to the form when the user's business unit is fetched
    if (usersFirstBusinessUnit) {
      setInputs((prevInputs) => ({
        ...prevInputs,
        businessUnit: usersFirstBusinessUnit,
      }));
    }
  }, [usersFirstBusinessUnit]); // Watch for changes in `usersFirstBusinessUnit`

  useEffect(() => {
    const fetchData = async () => {
      try {
        const wrappedResponse = await getData();
        const response = wrappedResponse?.response;
        console.log('response:', response);

        setLineItems(response?.lineItems || []);
        setDealStartDate(response?.dealProps?.start_date__c || '');

        const currencyCode = response?.dealProps?.deal_currency_code || '';
        setDealCurrencyCode(currencyCode);

        const usersFirstBusinessUnit = response?.usersFirstBusinessUnit || '';
        setUsersFirstBusinessUnit(usersFirstBusinessUnit);

        const dealCompanyCountry = response?.dealCompanyCountry || '';
        setDealCompanyCountry(dealCompanyCountry);

        setAllProducts(response?.allProducts || []);
        setAllBusinessUnits(response?.allBusinessUnits || []);
        setAllServiceCategories(response?.allServiceCategories || []);
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
        dealCompanyCountry={dealCompanyCountry}
        dealCurrencyCode={dealCurrencyCode}
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
  dealCompanyCountry,
  dealCurrencyCode,
}) => {
  const [openIndex, setOpenIndex] = useState(null);
  const [selectedLineItem, setSelectedLineItem] = useState(null);

  // // debug
  // useEffect(() => {
  //   console.log('lineItems:', lineItems);
  // }, [lineItems]);

  const toggleOpen = (index) => {
    // console.log(`Toggling index: ${index}`);
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
            dealCompanyCountry={dealCompanyCountry}
            dealCurrencyCode={dealCurrencyCode}
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
                handleFormSubmit={handleFormSubmit}
                setSelectedBusinessUnit={setSelectedBusinessUnit}
                setSelectedServiceCategory={setSelectedServiceCategory}
                setSelectedProduct={setSelectedProduct}
                selectedBusinessUnit={prepopulatedInputs.businessUnit}
                selectedServiceCategory={prepopulatedInputs.serviceCategory}
                selectedProduct={prepopulatedInputs.product}
                dealStartDate={dealStartDate}
                dealCompanyCountry={dealCompanyCountry}
                dealCurrencyCode={dealCurrencyCode}
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

function doOnSubmit(inputs, handleFormSubmit) {
  console.log('inputs in doOnSubmit', JSON.stringify(inputs, null, 2));

  // Ensure hsObjectId and all inputs are included
  const formData = { ...inputs };

  // Call parent submit handler
  handleFormSubmit(formData);
}

const ProductForm = ({
  allBusinessUnits,
  allServiceCategories,
  allProducts,
  onInputChange,
  inputs,
  handleFormSubmit,
  setSelectedBusinessUnit,
  setSelectedServiceCategory,
  setSelectedProduct,
  selectedBusinessUnit,
  selectedServiceCategory,
  selectedProduct,
  dealStartDate,
  dealCompanyCountry,
  dealCurrencyCode,
}) => {
  const [localInputs, setLocalInputs] = useState({
    ...inputs,
    country: inputs.country || dealCompanyCountry,
    businessUnit: inputs.businessUnit || selectedBusinessUnit,
    serviceCategory: inputs.serviceCategory || selectedServiceCategory,
    product: inputs.product || selectedProduct,
  });

  useEffect(() => {
    console.log('ProductForm localInputs updated:', localInputs);
  }, [localInputs]);

  useEffect(() => {
    setLocalInputs((prev) => ({
      ...prev,
      ...inputs,
      country: inputs.country || dealCompanyCountry,
      businessUnit: inputs.businessUnit || selectedBusinessUnit,
      serviceCategory: inputs.serviceCategory || selectedServiceCategory,
      product: inputs.product || selectedProduct,
    }));
  }, [inputs, dealCompanyCountry, selectedBusinessUnit, selectedServiceCategory, selectedProduct]);

  const updateLocalInputs = (name, value) => {
    setLocalInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Form onSubmit={(e) => doOnSubmit(localInputs, handleFormSubmit)}>
      <Flex direction="column" gap={'flush'} flex={'auto'}>
        <Flex direction="column" gap={FLEX_GAP}>
          <SelectionGroup
            allBusinessUnits={allBusinessUnits}
            allServiceCategories={allServiceCategories}
            allProducts={allProducts}
            onInputChange={(name, value) => {
              onInputChange(name, value);
              updateLocalInputs(name, value);
            }}
            setSelectedBusinessUnit={setSelectedBusinessUnit}
            setSelectedServiceCategory={setSelectedServiceCategory}
            setSelectedProduct={setSelectedProduct}
            selectedBusinessUnit={localInputs.businessUnit || ''}
            selectedServiceCategory={localInputs.serviceCategory || ''}
            selectedProduct={localInputs.product || ''}
          />
          <Divider distance="small" />
          <RevenueAndCalculatedFields
            inputs={localInputs}
            onInputChange={(name, value) => {
              onInputChange(name, value);
              updateLocalInputs(name, value);
            }}
            dealStartDate={dealStartDate}
            dealCompanyCountry={dealCompanyCountry}
            dealCurrencyCode={dealCurrencyCode}
          />
          <Divider distance="small" />
        </Flex>
        <Flex align="end" flex={'2'} direction="row" justify="center">
          <Box>
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
  dealCompanyCountry,
  dealCurrencyCode,
}) => {
  const [prepopulatedInputs, setPrepopulatedInputs] = useState({
    annualRevenueAmount: item.annual_revenue_amount || 0,
    gpFeePercent: item.gp_fee_percent || 0,
    gpFeeDollarAmount: item.gp_fee__ || 0,
    initialYearAmountOverride: item.initial_year_amount_override || 0,
    initialYearGpOverride: item.initial_year_gp_override || 0,
    markupPercent: item.markup_percent || 0,
    businessUnit: item.business_unit || '',
    serviceCategory: item.service_category || '',
    product: item.product_id || '',
    country: item.country || dealCompanyCountry,
    hsObjectId: item.hs_object_id || '',
  });

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
        country: item.country || dealCompanyCountry,
        hsObjectId: item.hs_object_id || '',
      });

      // Sync dropdown state
      setSelectedBusinessUnit(item.business_unit || '');
      setSelectedServiceCategory(item.service_category || '');
      setSelectedProduct(item.product_id || '');
    }
  }, [isOpen, item, dealCompanyCountry]);

  return (
    <Flex direction="row" gap={'flush'} align="center">
      <Flex direction="column" gap={'flush'} flex="1">
        <Link onClick={() => toggleOpen(index)}>
          <LineItem key={index} item={item} dealCurrencyCode={dealCurrencyCode} />
        </Link>
        {isOpen && (
          <>
            <Divider distance="small" />
            <ProductForm
              inputs={prepopulatedInputs}
              allBusinessUnits={allBusinessUnits}
              allServiceCategories={allServiceCategories}
              allProducts={allProducts}
              onInputChange={handleInputChange}
              handleFormSubmit={handleFormSubmit}
              setSelectedBusinessUnit={setSelectedBusinessUnit}
              setSelectedServiceCategory={setSelectedServiceCategory}
              setSelectedProduct={setSelectedProduct}
              selectedBusinessUnit={prepopulatedInputs.businessUnit}
              selectedServiceCategory={prepopulatedInputs.serviceCategory}
              selectedProduct={prepopulatedInputs.product}
              dealStartDate={dealStartDate}
              dealCompanyCountry={dealCompanyCountry}
              dealCurrencyCode={dealCurrencyCode}
            />
          </>
        )}
      </Flex>
    </Flex>
  );
};

// Product Name | Annual Revenue Amount | GP Fee Percent | GP Fee Amount

const LineItem = ({ item, dealCurrencyCode }) => {
  const lineItemDataPoints = [
    { label: 'Product Name', key: 'name', format: (value) => value || 'N/A' },
    {
      label: 'Annual Revenue Amount',
      key: 'annual_revenue_amount',
      format: (value) => (value ? formatCurrency(value, dealCurrencyCode) : 'N/A'),
    },
    { label: 'GP Fee Percent', key: 'gp_fee_percent', format: (value) => (value ? formatPercent(value) : 'N/A') },
    {
      label: 'GP Fee Amount',
      key: 'gp_fee__',
      format: (value) => (value ? formatCurrency(value, dealCurrencyCode) : 'N/A'),
    },
  ];

  return (
    <Tile flush={false} compact={true}>
      <Flex direction="row" gap="xs" wrap="nowrap" justify="start">
        {lineItemDataPoints.map((dataPoint) => (
          <Box key={dataPoint.key} flex={dataPoint.key === 'name' ? 10 : 4}>
            <Flex direction="column" gap="xs" align="end" justify="end" wrap="wrap">
              <Text variant="microcopy" format={{ fontWeight: 'bold' }}>
                {dataPoint.label}:
              </Text>
              <Text truncate={true} variant="microcopy">
                {dataPoint.format(item[dataPoint.key])}
              </Text>
            </Flex>
          </Box>
        ))}
      </Flex>
    </Tile>
  );
};
