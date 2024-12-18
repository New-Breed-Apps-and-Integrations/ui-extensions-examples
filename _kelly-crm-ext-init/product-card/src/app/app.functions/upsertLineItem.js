const axios = require('axios');
const { getAllLineItems } = require('./shared');
// Entry function of this module, it creates a quote together with line items
exports.main = async (context = {}) => {
  const ACCESS_TOKEN = process.env['PRIVATE_APP_ACCESS_TOKEN'];
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  };

  // let context = {
  //   propertiesToSend: {
  //     hs_object_id: '29766991696',
  //   },
  //   parameters: {
  //     formData: {
  //       annualRevenue: 3100000,
  //       currentYearOverride: 203000,
  //       gpFeePercent: 33,
  //     },
  //   },
  // };

  try {
    console.log(`\n\nFRESH Line Item REQUEST!\n\n`);
    console.log(`context: ${JSON.stringify(context, null, 2)}`);

    const { hs_object_id: dealId } = context.propertiesToSend;
    const { formData } = context.parameters;

    let newLineItem;
    if (formData.lineItemId) {
      newLineItem = await updateALineItem({ headers, dealId, formData });
    } else {
      newLineItem = await insertALineItem({ headers, dealId, formData });
    }

    await updateDealTotalAmount({ headers, dealId });

    return { newLineItem };
  } catch (error) {
    console.error(error.message);
    console.log(JSON.stringify(error.response.data, null, 2));
    return { error: error.message };
  }
};
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

async function updateALineItem({ headers, dealId, formData }) {
  const url = `https://api.hubapi.com/crm/v3/objects/line_items/${formData.lineItemId}`;
  const data = {
    properties: {
      ...formData,
    },
  };
  const response = await axios.patch(url, data, { headers });
  return response.data;
}

async function insertALineItem({ headers, dealId, formData }) {
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
      // hs_sku: formData.hsSku || '',
      // currency: formData.currency || 'USD',
    },
  };

  const response = await axios.post(url, data, { headers });
  console.log(`response: ${JSON.stringify(response.data, null, 2)}`);
  return response.data;
}
