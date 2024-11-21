import React, { useState, useEffect } from 'react';
import { hubspot, Tile, Divider, Flex, Box, Text, Select, Input, Button } from '@hubspot/ui-extensions';
import { LoadingSpinner } from '@hubspot/ui-extensions';
import { Products } from './components/Products';
import { BusinessUnits } from './components/BusinessUnits';
import { MarketCategory } from './components/MarketCategory';
import { CalculatedField } from './components/CalculatedField';
const FLEX_GAP = 'small'; // 'flush' (default) | 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'

// direction	'row' (default) | 'column'	Arranges the components horizontally or vertically by setting the main axis.
// justify	'start' (default) | 'center' | 'end' | 'around' | 'between'	Distributes components along the main axis using the available free space.
// align	'start' | 'center' | 'end' | 'baseline' | 'stretch' (default)	Distributes components along the cross-axis using the available free space.
// alignSelf	'start' | 'center' | 'end' | 'baseline' | 'stretch'	Distributes a child component along the cross-axis using the available free space. Use this prop for nested Flex and Box components to align them differently from other child components in the Flex group.

// TODO:
// - make calculated fields calculate
// - form starts hidden, show when line item or 'add line item' is selected
// - add drawers/rows for each exisinting line item at the top of the card, append a row with 'Add Line Item'
// - make the 'Save' button create a new line item
// - figure out how to refresh the page/data

// Define the extension to be run within the Hubspot CRM
hubspot.extend(({ runServerlessFunction, context, actions, refreshObjectProperties }) => (
  <ProductCard runServerless={runServerlessFunction} context={context} refreshObjectProperties={actions.refreshObjectProperties} actions={actions} />
));

const ButtonGroup = () => (
  <Box border="10px solid #000" alignSelf="center" padding="20px">
    <Button>Save</Button>
  </Box>
);

const SelectionGroup = ({ allBusinessUnits, allMarketCategories, allProducts }) => (
  <Flex direction="column" gap={FLEX_GAP}>
    <Flex direction="row" gap={FLEX_GAP} justify="between" align="stretch" alignSelf="stretch" wrap="nowrap">
      <Box flex={'auto'}>
        <BusinessUnits allBusinessUnits={allBusinessUnits} />
      </Box>
      <Box flex={'auto'}>
        <MarketCategory allMarketCategories={allMarketCategories} />
      </Box>
    </Flex>

    <Box>
      <Products allProducts={allProducts} />
    </Box>
  </Flex>
);

const InputGroup = () => (
  <Flex direction="row" gap={FLEX_GAP}>
    <Flex direction="column" gap={FLEX_GAP}>
      <Input label="Annual Revenue Amount" />
      <Input label="Current Year Amount Override" />
      <Input label="GP Fee Percent" />
      <Input label="Current Year GP Override" />
      <Input label="Markup Percent" />
    </Flex>
    <Flex direction="column" gap={FLEX_GAP} justify="center">
      <CalculatedFields />
    </Flex>
  </Flex>
);

const CalculatedFields = () => (
  <Tile>
    <Text format={{ fontWeight: 'bold' }} variant="heading">
      Calculated Fields:
    </Text>
    <CalculatedField input={{ label: 'Initial Year Amount', value: '100000' }} />
    <CalculatedField input={{ label: 'GP Fee Amount', value: '10000' }} />
    <CalculatedField input={{ label: 'Current Year GP Fee', value: '10000' }} />
  </Tile>
);

const Drawers = () => (
  <Flex direction="column" gap={'flush'}>
    <Tile>
      <Text variant="microcopy">sample line item 1</Text>
    </Tile>
    <Tile>
      <Text variant="microcopy">sample line item 1</Text>
    </Tile>
    <Tile>
      <Text variant="microcopy">sample line item 1</Text>
    </Tile>
  </Flex>
);

const ProductForm = ({ allBusinessUnits, allMarketCategories, allProducts }) => (
  <Flex direction="column" gap={'flush'} flex={'auto'}>
    <Flex direction="row">
      <Text variant="heading">Select a Product to begin</Text>
    </Flex>

    <Flex direction="column" gap={FLEX_GAP}>
      <SelectionGroup allBusinessUnits={allBusinessUnits} allMarketCategories={allMarketCategories} allProducts={allProducts} />
      <Divider distance="small" />
      <InputGroup />
      <Divider distance="large" />
    </Flex>
    <Flex align="end" flex={'2'} direction="row" justify="center">
      <Box flex={'1'}>
        <ButtonGroup />
      </Box>
    </Flex>
  </Flex>
);

const ProductCard = ({ runServerless, context, refreshObjectProperties, actions }) => {
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState(null);
  const [allBusinessUnits, setAllBusinessUnits] = useState(null);
  const [allMarketCategories, setAllMarketCategories] = useState(null);

  const getData = () => {
    return runServerless({
      name: 'getData',
      propertiesToSend: ['hs_object_id'],
      parameters: {
        uiContext: context,
      },
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const wrappedResponse = await getData();
        const response = wrappedResponse.response;
        console.log(`Response from serverless function: ${JSON.stringify(response, null, 2)}`);

        // Check if response contains the expected data
        setAllProducts(response.allProducts);
        setAllBusinessUnits(response.allBusinessUnits);
        setAllMarketCategories(response.allMarketCategories);
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
      <Drawers />
      <Divider distance="small" />
      <ProductForm allBusinessUnits={allBusinessUnits} allMarketCategories={allMarketCategories} allProducts={allProducts} />
    </Flex>
  );
};

export default ProductCard;
