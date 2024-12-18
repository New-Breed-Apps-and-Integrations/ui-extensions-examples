let allProps = [
  'amount',
  'annual_revenue_amount',
  'business_id',
  'business_unit',
  'business_unit_code',
  'createdate',
  'current_year_amount_override',
  'current_year_gp_fee',
  'current_year_gp_override',
  'description',
  'discount',
  'gp_fee',
  'gp_fee__',
  'gp_fee_percent',
  'hs_acv',
  'hs_all_accessible_team_ids',
  'hs_all_assigned_business_unit_ids',
  'hs_all_owner_ids',
  'hs_all_team_ids',
  'hs_allow_buyer_selected_quantity',
  'hs_arr',
  'hs_auto_tax_amount',
  'hs_billing_period_end_date',
  'hs_billing_period_start_date',
  'hs_billing_start_delay_days',
  'hs_billing_start_delay_months',
  'hs_billing_start_delay_type',
  'hs_buyer_selected_quantity_max',
  'hs_buyer_selected_quantity_min',
  'hs_cost_of_goods_sold',
  'hs_created_by_user_id',
  'hs_discount_percentage',
  'hs_is_editable_price',
  'hs_is_optional',
  'hs_lastmodifieddate',
  'hs_line_item_currency_code',
  'hs_margin',
  'hs_margin_acv',
  'hs_margin_arr',
  'hs_margin_mrr',
  'hs_margin_tcv',
  'hs_merged_object_ids',
  'hs_mrr',
  'hs_object_id',
  'hs_object_source',
  'hs_object_source_detail_1',
  'hs_object_source_detail_2',
  'hs_object_source_detail_3',
  'hs_object_source_id',
  'hs_object_source_label',
  'hs_object_source_user_id',
  'hs_position_on_quote',
  'hs_post_tax_amount',
  'hs_pre_discount_amount',
  'hs_product_id',
  'hs_product_type',
  'hs_read_only',
  'hs_recurring_billing_end_date',
  'hs_recurring_billing_number_of_payments',
  'hs_recurring_billing_period',
  'hs_recurring_billing_start_date',
  'hs_recurring_billing_terms',
  'hs_shared_team_ids',
  'hs_shared_user_ids',
  'hs_sku',
  'hs_sync_amount',
  'hs_tax_amount',
  'hs_tax_category',
  'hs_tax_label',
  'hs_tax_rate',
  'hs_tax_rate_group_id',
  'hs_tcv',
  'hs_term_in_months',
  'hs_total_discount',
  'hs_unique_creation_key',
  'hs_variant_id',
  'hs_was_imported',
  'hubspot_owner_assigneddate',
  'hubspot_owner_id',
  'hubspot_team_id',
  'initial_year_amount',
  'market_category',
  'markup_percent',
  'mtest',
  'name',
  'price',
  'product_code',
  'product_status',
  'product_type_',
  'quantity',
  'recurringbillingfrequency',
  'service_category',
  'specialty',
  'tax',
  'taxonomy_category',
];

// Product Name
// Annual Revenue Amount (annual_revenue_amount)
// CY Amount Override (current_year_amount_override)
// GP Fee % (gp_fee_percent)
// GP Fee $ (gp_fee__)
// CY GP Override (current_year_gp_override)
// Markup % (markup_percent)
// Initial Year GP Fee (can't find in HS)
// Initial Year Amount
// Total $ (amount?)

// Annual Revenue Amount: this is the dollar value associated to the product
//  field type: $
// required: no
// default value: $0

// CY Amount Override: if entered, this value will re-calculate the value in the "Initial Year GP Fee" field based on the deal start date.
//  field type: $
// required: no
// default value: $0

// GP Fee %
// field type %
// required: no
// default value 0%

// GP Fee $: this field is simply a reflection of the GP Fee Percentage that is entered and is uneditable.  Ideally this would calculate in real time.
//  field type: $
// required: no
// default value: $0
// calculation: [Annual Revenue Amount] x [GP Fee %]

// CY GP Override
// field type: $
// required: no
// default value: $0

// Markup %: the percentage entered increases the total for that individual product. Basically the reverse of a discount and it applies at the product level.
// field type: %
// required: no
// default value 0%

// Initial Year GP Fee: this is a sum of the GP fee prorated for the time remaining in the current year.
// field type $
// required: no
// default value: $0
// calculation: [initial year amount] x [GP Fee %]

// Quantity: we would like to hide this field but it may be required by HS. Quantity does not affect any calculations.

// Initial Year Amount: this is a prorated dollar value based on the deal start date and the remaining time left in the year
// field type: $
// required (atofilled/ uneditable)
// default value: autocalculated,n/a)
// calculation: [Annual Revenue Amount] x [Dec 31 current year] - [Deal Start Date]

// Country: the user has the ability to specify a country
// field type: text
// required: no
// default value: none

// const marketCategoriesSampleData = [
//   {
//     id: 1,
//     name: 'Market Category 1',
//     value: 1,
//   },
//   {
//     id: 2,
//     name: 'Market Category 2',
//     value: 2,
//   },
// ];

// const products = [
//   {
//     "id": "15413323446",
//     "properties": {
//       "createdate": "2024-10-28T19:41:11.070Z",
//       "description": "1",
//       "hs_all_assigned_business_unit_ids": null,
//       "hs_lastmodifieddate": "2024-11-07T18:18:07.781Z",
//       "hs_object_id": "15413323446",
//       "name": "Mark Test",
//       "price": "1",
//       "quantity": null
//     },
//     "createdAt": "2024-10-28T19:41:11.070Z",
//     "updatedAt": "2024-11-07T18:18:07.781Z",
//     "archived": false
//   }
// ]

// const businessUnitsSampleData = [
//   {
//     id: '1253464',
//     name: 'Kelly P&I',
//     logoMetadata: null,
//   },
// ];
