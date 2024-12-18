const axios = require('axios');

function flattenHubspotObject(obj) {
  if (!obj || typeof obj !== 'object' || !obj.properties) {
    return obj;
  }

  const tmpObj = {
    ...obj,
    ...obj.properties,
  };

  delete tmpObj.properties;
  delete tmpObj.hs_lastmodifieddate;
  delete tmpObj.createdate;
  delete tmpObj.createdAt;
  delete tmpObj.updatedAt;
  delete tmpObj.archived;

  return tmpObj;
}

async function getFullLineItems(headers, lineItemIds) {
  const url = `https://api.hubapi.com/crm/v3/objects/line_items/batch/read?archived=false`;

  const inputs = lineItemIds.map((id) => ({ id }));

  const properties = [
    'name',
    'annual_revenue_amount',
    'initial_year_amount_override',
    'gp_fee_percent',
    'gp_fee__',
    'initial_year_gp_override',
    'markup_percent',
    'initial_year_amount',
    'initial_year_gp_fee',
    'hs_product_id',
    'amount',
    'hs_sku',
    'currency',
    'country',
  ];
  const data = {
    inputs,
    properties,
  };

  const response = await axios.post(url, data, { headers });
  return response.data.results;
}

async function getAllLineItems(headers, dealId) {
  const url = `https://api.hubapi.com/crm/v4/objects/deals/${dealId}/associations/line_items`;
  const response = await axios.get(url, { headers });
  const lineItemIds = response.data.results.map((result) => result.toObjectId);
  if (lineItemIds.length > 0) {
    const lineItems = await getFullLineItems(headers, lineItemIds);
    return lineItems.map(flattenHubspotObject);
  }
  return [];
}

module.exports = {
  flattenHubspotObject,
  getFullLineItems,
  getAllLineItems,
};
