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
    console.log('\nFRESH Line Item REQUEST!\n');
    console.log(`context: ${JSON.stringify(context, null, 2)}`);

    const { hs_object_id: dealId } = context.propertiesToSend;
    const { formData } = context.parameters;
    console.log(`formData: ${JSON.stringify(formData, null, 2)}`);

    const lineItemHsId = formData.hsObjectId;
    const newLineItem = lineItemHsId
      ? await updateLineItem({ headers, lineItemHsId, formData })
      : await insertLineItem({ headers, dealId, formData });

    await updateDealProperties({ headers, dealId });

    return { newLineItem };
  } catch (error) {
    console.log('we have an error');
    console.error(error.message);
    const msg = error?.response?.data?.message || error?.message;
    console.log(JSON.stringify(msg, null, 2));
    return { error: msg };
  }
};

async function updateDealProperties({ headers, dealId }) {
  const lineItems = await getAllLineItems(headers, dealId);
  const totalAmount = lineItems.reduce((sum, item) => Number(sum) + Number(item.annual_revenue_amount), 0);
  const totalGpFee = lineItems.reduce((sum, item) => Number(sum) + Number(item.gp_fee__), 0);
  const dealInitialYearAmount = lineItems.reduce(
    (sum, item) => Number(sum) + Number(item.initial_year_amount_override || item.initial_year_amount),
    0
  );
  const dealInitialYearGpFee = lineItems.reduce(
    (sum, item) => Number(sum) + Number(item.initial_year_gp_override || item.initial_year_gp_fee),
    0
  );
  const url = `https://api.hubapi.com/crm/v3/objects/deals/${dealId}`;
  const data = {
    properties: {
      amount: totalAmount,
      gp_fee__c: totalGpFee,
      gp___fee__: totalGpFee / totalAmount,
      first_year_amount: dealInitialYearAmount,
      first_year_gp_fee: dealInitialYearGpFee,
    },
  };
  const response = await axios.patch(url, data, { headers });
  return response.data;
}

async function updateLineItem({ headers, lineItemHsId, formData }) {
  console.log(`updateLineItem: ${lineItemHsId}`);
  const url = `https://api.hubapi.com/crm/v3/objects/line_items/${lineItemHsId}`;
  const data = {
    properties: {
      id: lineItemHsId,
      annual_revenue_amount: formData.annualRevenueAmount || '',
      country: formData.country || '',
      gp_fee__: formData.gpFeeDollarAmount || '',
      gp_fee_percent: formData.gpFeePercent || '',
      hs_product_id: formData.product || '',
      initial_year_amount_override: formData.initialYearAmountOverride || '',
      initial_year_amount: formData.initialYearAmount || '',
      initial_year_gp_fee: formData.initialYearGpFee || '',
      initial_year_gp_override: formData.initialYearGpOverride || '',
      markup_percent: formData.markupPercent || '',
      name: formData.name || '',
      quantity: 1,
    },
  };
  const response = await axios.patch(url, data, { headers });
  return response.data;
}

async function insertLineItem({ headers, dealId, formData }) {
  console.log(`insertLineItem: ${dealId}`);
  const url = `https://api.hubapi.com/crm/v3/objects/line_items/`;

  const data = {
    associations: [
      {
        types: [
          {
            associationCategory: 'HUBSPOT_DEFINED',
            associationTypeId: 20,
          },
        ],
        to: {
          id: dealId,
        },
      },
    ],

    properties: {
      annual_revenue_amount: formData.annualRevenueAmount || '',
      initial_year_amount_override: formData.initialYearAmountOverride || '',
      gp_fee_percent: formData.gpFeePercent || '',
      gp_fee__: formData.gpFeeDollarAmount || '',
      initial_year_gp_override: formData.initialYearGpOverride || '',
      markup_percent: formData.markupPercent || '',
      initial_year_gp_fee: formData.initialYearGpFee || '',
      initial_year_amount: formData.initialYearAmount || '',
      hs_product_id: formData.product || '',
      quantity: 1,
      country: formData.country || '',
    },
  };

  const response = await axios.post(url, data, { headers });
  console.log(`response: ${JSON.stringify(response.data, null, 2)}`);
  return response.data;
}
