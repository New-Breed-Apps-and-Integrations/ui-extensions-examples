const axios = require('axios');

exports.main = async (context = {}) => {
  const ACCESS_TOKEN = process.env['PRIVATE_APP_ACCESS_TOKEN'];
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  };
  console.log(`CLEARING LINE ITEMS!\n`);

  try {
    const { hs_object_id } = context.propertiesToSend;

    const deleteResponse = await deleteLineItems(headers, hs_object_id);
    console.log(`deleteResponse: ${JSON.stringify(deleteResponse, null, 2)}`);
    await updateDealTotalAmount({ headers, dealId: hs_object_id }); // Update deal total amount after deleting line items to ensure the deal total is correct after deletion

    return { deleteResponse };
  } catch (error) {
    console.error(error.message);
    console.log(JSON.stringify(error.response.data, null, 2));
    return { error: error.message };
  }
};

async function deleteLineItems(headers, dealId) {
  const url = `https://api.hubapi.com/crm/v4/objects/deals/${dealId}/associations/line_items`;
  const response = await axios.get(url, { headers });
  const lineItemIds = response.data.results.map((result) => result.toObjectId);

  if (lineItemIds.length > 0) {
    for (const lineItemId of lineItemIds) {
      await deleteLineItem(headers, lineItemId);
    }
  }
  return true;
}

async function deleteLineItem(headers, lineItemId) {
  const url = `https://api.hubapi.com/crm/v3/objects/line_items/${lineItemId}`;
  const response = await axios.delete(url, { headers });
  return response.data;
}

function flattenHubspotObject(obj) {
  if (!obj || typeof obj !== 'object' || !obj.properties) {
    return obj;
  }

  return {
    ...obj,
    ...obj.properties,
  };
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

async function updateDealTotalAmount({ headers, dealId }) {
  const lineItems = await getAllLineItems(headers, dealId);
  const totalAmount = lineItems.reduce((sum, item) => Number(sum) + Number(item.annual_revenue_amount), 0);
  const url = `https://api.hubapi.com/crm/v3/objects/deals/${dealId}`;
  const data = {
    properties: { amount: totalAmount },
  };
  const response = await axios.patch(url, data, { headers });
  return response.data;
}
