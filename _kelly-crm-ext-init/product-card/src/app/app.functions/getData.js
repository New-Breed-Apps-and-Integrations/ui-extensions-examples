const axios = require('axios');
const { getAllLineItems } = require('./shared');
// Entry function of this module, it creates a quote together with line items
exports.main = async (context = {}) => {
  const ACCESS_TOKEN = process.env['PRIVATE_APP_ACCESS_TOKEN'];
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  };

  try {
    console.log(`\nFRESH REQUEST!\n`);
    // console.log(`context: ${JSON.stringify(context, null, 2)}`);

    const { hs_object_id } = context.propertiesToSend;
    const { uiContext } = context.parameters;
    const userId = uiContext.user.id;

    const allProducts = await getAllProducts(headers);
    const allBusinessUnits = await getAllBusinessUnits(headers, userId);
    const allServiceCategories = await getAllServiceCategories(headers);
    const lineItems = await getAllLineItems(headers, hs_object_id);
    const dealStartDate = await getDealStartDate(headers, hs_object_id);
    // console.log(`lineItemsSample: ${JSON.stringify(lineItems[0], null, 2)}`);

    return { allProducts, allBusinessUnits, allServiceCategories, lineItems, dealStartDate };
  } catch (error) {
    console.error(error.message);
    console.log(JSON.stringify(error.response.data, null, 2));
    return { error: error.message };
  }
};

async function getDealStartDate(headers, dealId) {
  const url = `https://api.hubapi.com/crm/v3/objects/deals/${dealId}?properties=start_date__c`;
  const response = await axios.get(url, { headers });
  return response?.data?.properties?.start_date__c;
}

async function getAllServiceCategories(headers) {
  // const url = `https://api.hubapi.com/crm/v3/objects/market_categories`;
  // const response = await axios.get(url, { headers });
  // return response.data.results;

  // const service_category;
  const serviceCategories = [
    {
      label: 'Staffing',
      value: 'Staffing',
    },
    {
      label: 'BPO',
      value: 'BPO',
    },
    {
      label: 'CWO',
      value: 'CWO',
    },
    {
      label: 'KellyConnect',
      value: 'KellyConnect',
    },
    {
      label: 'RPO',
      value: 'RPO',
    },
    {
      label: 'Advisory',
      value: 'Advisory',
    },
    {
      label: 'TSCM',
      value: 'TSCM',
    },
    {
      label: 'KLMS',
      value: 'KLMS',
    },
    {
      label: 'Ayers',
      value: 'Ayers',
    },
    {
      label: 'Permanent Placement',
      value: 'Permanent Placement',
    },
    {
      label: 'Outcome-Based Services',
      value: 'Outcome-Based Services',
    },
    {
      label: 'Talent Solutions',
      value: 'Talent Solutions',
    },
  ];

  return serviceCategories;
}

async function getAllProducts(headers) {
  const properties = [
    'hs_all_assigned_business_unit_ids',
    'name',
    'description',
    'price',
    'quantity',
    'hs_product_category',
    'service_category',
    'business_unit',
    'country',
  ];
  const url = `https://api.hubapi.com/crm/v3/objects/products?properties=${properties.join(',')}`;
  const response = await axios.get(url, { headers });
  return response.data.results;
}

async function getAllBusinessUnits(headers, userId) {
  const url = `https://api.hubapi.com/business-units/v3/business-units/user/${userId}`;
  const response = await axios.get(url, { headers });
  const businessUnits = response.data.results;
  // businessUnits.push({ id: 'All Units', name: 'All Units', logoMetadata: null });
  return businessUnits;
}
