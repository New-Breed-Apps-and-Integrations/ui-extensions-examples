const axios = require('axios');

const DEBUG = true;

// Entry function of this module, it creates a quote together with line items
exports.main = async (context = {}) => {
  const ACCESS_TOKEN = process.env['PRIVATE_APP_ACCESS_TOKEN'];
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  };

  try {
    console.log(`\n\nFRESH REQUEST!\n\n`);
    console.log(`context: ${JSON.stringify(context, null, 2)}`);

    const { hs_object_id } = context.propertiesToSend;
    const { uiContext } = context.parameters;
    const userId = uiContext.user.id;

    const allProducts = await getAllProducts(headers);
    const allBusinessUnits = await getAllBusinessUnits(headers, userId);
    const allMarketCategories = await getAllMarketCategories(headers);

    if (DEBUG) {
      console.log(`products: ${JSON.stringify(allProducts, null, 2)}`);
      console.log(`businessUnits: ${JSON.stringify(allBusinessUnits, null, 2)}`);
      console.log(`marketCategories: ${JSON.stringify(allMarketCategories, null, 2)}`);
    }

    return { allProducts, allBusinessUnits, allMarketCategories };
  } catch (error) {
    console.error(error.message);
    console.log(JSON.stringify(error.response.data, null, 2));
    return { error: error.message };
  }
};

async function getAllMarketCategories(headers) {
  // const url = `https://api.hubapi.com/crm/v3/objects/market_categories`;
  // const response = await axios.get(url, { headers });
  // return response.data.results;
  const seedData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const marketCategories = seedData.map((id) => ({ id, name: `Market Category ${id}`, value: id }));

  return marketCategories;
}

async function getAllProducts(headers) {
  const properties = ['hs_all_assigned_business_unit_ids', 'name', 'description', 'price', 'quantity', 'hs_product_category'];
  const url = `https://api.hubapi.com/crm/v3/objects/products?properties=${properties.join(',')}`;
  const response = await axios.get(url, { headers });
  return response.data.results;
}

async function getAllBusinessUnits(headers, userId) {
  const url = `https://api.hubapi.com/business-units/v3/business-units/user/${userId}`;
  const response = await axios.get(url, { headers });
  const businessUnits = response.data.results;
  businessUnits.push({ id: '1253464', name: 'All Units', logoMetadata: null });
  return businessUnits;
}

const SECONDS_IN_HOUR = 3600;
const HOURS_IN_DAY = 24;
const DAYS_IN_WEEK = 7;
const SECONDS_IN_WEEK = DAYS_IN_WEEK * HOURS_IN_DAY * SECONDS_IN_HOUR;

// Function to create a quote using HubSpot API client
async function createQuote({ dealId, quoteName }) {
  const request = {
    properties: {
      hs_title: quoteName,
      hs_expiration_date: Date.now() + SECONDS_IN_WEEK, // Expires in one week
      hs_status: 'DRAFT',
      hs_currency: 'USD',
      hs_language: 'en',
      hs_locale: 'en-us',
    },
    associations: [
      {
        to: { id: dealId },
        types: [
          {
            associationCategory: 'HUBSPOT_DEFINED',
            associationTypeId: hubspot.AssociationTypes.quoteToDeal,
          },
        ],
      },
    ],
  };

  return await hubspotClient.crm.quotes.basicApi.create(request);
}

// Function to create a line item and associate with quote
async function addLineItem({ productId, quoteId, quantity }) {
  const request = {
    properties: {
      hs_product_id: productId,
      quantity,
    },
    associations: [
      {
        to: { id: quoteId },
        types: [
          {
            associationCategory: 'HUBSPOT_DEFINED',
            associationTypeId: hubspot.AssociationTypes.lineItemToQuote,
          },
        ],
      },
    ],
  };

  await hubspotClient.crm.lineItems.basicApi.create(request);
}

// Function to find a product by SKU using HubSpot API client
async function findProductBySKU(sku) {
  try {
    const product = await hubspotClient.crm.products.basicApi.getById(sku, undefined, undefined, undefined, undefined, 'hs_sku');
    return product;
  } catch (error) {
    if (error.code != 404) {
      console.error(error.message);
    }
    return null;
  }
}
// if (products === null) {
//     return { error: 'PRODUCT_NOT_FOUND' };
// } else {
//     const quote = await createQuote({
//         dealId: hs_object_id,
//         quoteName,
//     });

//     // Add line items to a newly created quote
//     const lineItems = [];
//     for (let i = 0; i < numberOfBuses; i++) {
//         lineItems.push(
//             addLineItem({
//                 productId: product.id,
//                 quoteId: quote.id,
//                 quantity: distance,
//             })
//         );
//     }
//     await Promise.all(lineItems);
//     return { quote };
// }
