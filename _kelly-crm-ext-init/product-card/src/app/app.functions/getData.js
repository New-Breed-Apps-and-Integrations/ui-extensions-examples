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
    const dealProps = await getDealProps(headers, hs_object_id);
    const dealCompanyCountry = await getDealsFirstCompanyCountry(headers, hs_object_id);
    // console.log(`lineItemsSample: ${JSON.stringify(lineItems[0], null, 2)}`);

    return { allProducts, allBusinessUnits, allServiceCategories, lineItems, dealProps, dealCompanyCountry };
  } catch (error) {
    debugger;
    console.error(error.message);
    console.log(JSON.stringify(error?.response?.data, null, 2));
    return { error: error.message };
  }
};

async function getDealProps(headers, dealId) {
  const url = `https://api.hubapi.com/crm/v3/objects/deals/${dealId}?properties=start_date__c,deal_currency_code,deal_currency`;
  const response = await axios.get(url, { headers });
  return response?.data?.properties;
}

async function getDealsFirstCompanyCountry(headers, dealId) {
  // get the first company associated to the deal
  const companyIds = await getAllObjectIdsAssociatedWithObject(headers, dealId, 'deals', 'companies');
  const companyId = companyIds[0];
  return await getCompanyCountry(headers, companyId);
}

async function getCompanyCountry(headers, companyId) {
  const url = `https://api.hubapi.com/crm/v3/objects/companies/${companyId}?properties=country`;
  const response = await axios.get(url, { headers });
  return response?.data?.properties?.country;
}

async function getAllObjectIdsAssociatedWithObject(headers, fromObjectId, fromObjectType, toObjectType) {
  let hasMore = true;
  let after = '';
  let resultsArray = [];

  while (hasMore) {
    let url = `https://api.hubapi.com/crm/v4/objects/${fromObjectType}/${fromObjectId}/associations/${toObjectType}?limit=100${after}`;

    let res = await axios.get(url, { headers });

    for (const association of res.data.results) {
      resultsArray.push(association.toObjectId);
    }

    try {
      console.log('PAGING NEXT', res.data.paging.next);
      after = res.data.paging.next.after;
      after = '&after=' + after;
      hasMore = true;
    } catch (e) {
      hasMore = false;
    }
  }
  await sleep(100);

  return resultsArray;
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
  businessUnits.unshift({ id: 'All Units', name: 'All Units', logoMetadata: null });
  return businessUnits;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
