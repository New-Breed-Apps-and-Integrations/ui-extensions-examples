import { useState } from 'react';
import { useEffect } from 'react';

import { Flex } from '@hubspot/ui-extensions';
import { Input } from '@hubspot/ui-extensions';
import { NumberInput } from '@hubspot/ui-extensions';

import { formatCurrency, formatPercent } from '../helpers/formatHelper';

const FLEX_GAP = 'small';
export const RevenueAndCalculatedFields = ({
  inputs = {},
  onInputChange,
  dealStartDate,
  dealCompanyCountry,
  dealCurrencyCode,
}) => {
  const [localInputs, setLocalInputs] = useState({
    ...inputs,
    prepopulatedInputs: inputs.prepopulatedInputs || {},
    country: inputs.country || '',
  });
  const [calculatedFields, setCalculatedFields] = useState({
    initialYearAmount: '0.00',
    initialYearGpFee: '0.00',
    gpFeeDollarAmount: '0.00',
  });

  useEffect(() => {
    setLocalInputs(inputs); // Sync external updates
  }, [inputs]);

  useEffect(() => {
    calculateFields(); // Recalculate fields whenever relevant inputs change
  }, [localInputs.annualRevenueAmount, localInputs.gpFeePercent, dealStartDate]);

  const handleInputChange = (name, value) => {
    console.log(`in handleInputChange, name: ${name}, value: ${value}`);
    console.log(`typeof value: ${typeof value}`);
    let formattedValue = typeof value === 'number' ? value.toFixed(2) : value;

    if (name === 'gpFeePercent' || name === 'markupPercent') {
      // Remove any non-numeric characters except for the decimal point
      let unalphadValue = formattedValue.replace(/[^\d.]/g, '');
      // Append the percent symbol
      formattedValue = `${unalphadValue}%`;
    }

    setLocalInputs((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    // Pass the numeric value to the parent
    onInputChange(name, parseFloat(formattedValue) || 0);
  };

  const calculateFields = () => {
    const annualRevenueAmount = parseFloat(localInputs.annualRevenueAmount) || 0;
    const gpFeePercent = parseFloat(localInputs.gpFeePercent) || 0;

    // console.log(`annualRevenueAmount: ${annualRevenueAmount}`);
    // console.log(`gpFeePercent: ${gpFeePercent}`);
    // console.log(`dealStartDate: ${dealStartDate}`);

    const yearProgressDaysTodayOnStartDate =
      (new Date(dealStartDate) - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24);
    const currentYear = new Date(dealStartDate).getFullYear();
    const daysInYear = (new Date(currentYear, 11, 31) - new Date(currentYear, 0, 0)) / (1000 * 60 * 60 * 24);

    const initialYearAmount = ((yearProgressDaysTodayOnStartDate / daysInYear) * annualRevenueAmount).toFixed(2);
    // console.log(`initialYearAmount: ${initialYearAmount}`);
    // console.log(`yearProgressDaysTodayOnStartDate: ${yearProgressDaysTodayOnStartDate}`);
    // console.log(`daysInYear: ${daysInYear}`);
    // console.log(`annualRevenueAmount: ${annualRevenueAmount}`);
    // console.log(`gpFeePercent: ${gpFeePercent}`);

    const initialYearGpFee = (initialYearAmount * (gpFeePercent / 100)).toFixed(2);
    const gpFeeDollarAmount = (annualRevenueAmount * (gpFeePercent / 100)).toFixed(2);

    // console.log(`initialYearAmount: ${initialYearAmount}`);
    // console.log(`initialYearGpFee: ${initialYearGpFee}`);
    // console.log(`gpFeeDollarAmount: ${gpFeeDollarAmount}`);
    // console.log(`localInputs: ${JSON.stringify(localInputs, null, 2)}`);

    setCalculatedFields({
      initialYearAmount,
      initialYearGpFee,
      gpFeeDollarAmount,
    });

    // Pass calculated fields to the parent
    onInputChange('initialYearAmount', parseFloat(initialYearAmount));
    onInputChange('initialYearGpFee', parseFloat(initialYearGpFee));
    onInputChange('gpFeeDollarAmount', parseFloat(gpFeeDollarAmount));
  };

  return (
    <Flex direction="row" gap={FLEX_GAP} align="stretch">
      {/* Left Column */}
      <Flex direction="column" gap={FLEX_GAP} style={{ flex: 1 }}>
        <Input
          label="Annual Revenue Amount"
          value={localInputs.annualRevenueAmount}
          onChange={(e) => handleInputChange('annualRevenueAmount', e)}
          onBlur={(e) => handleInputChange('annualRevenueAmount', e)}
          precision={2}
        />
        <NumberInput
          label="GP Fee Percent"
          value={localInputs.gpFeePercent}
          onChange={(e) => handleInputChange('gpFeePercent', e)}
          onBlur={(e) => handleInputChange('gpFeePercent', e)}
          formatStyle="percent"
          precision={2}
        />
        <Input
          label="Initial Year Amount"
          value={formatCurrency(calculatedFields.initialYearAmount, dealCurrencyCode)}
          readOnly
          precision={2}
        />
        <Input
          label="Initial Year GP Fee"
          value={formatCurrency(calculatedFields.initialYearGpFee, dealCurrencyCode)}
          readOnly
          precision={2}
        />
        <NumberInput
          label="Markup Percent"
          value={localInputs.markupPercent}
          onChange={(e) => handleInputChange('markupPercent', e)}
          onBlur={(e) => handleInputChange('markupPercent', e)}
          formatStyle="percent"
          precision={2}
          suffix="%"
        />
      </Flex>

      {/* Right Column */}
      <Flex direction="column" gap={FLEX_GAP} style={{ flex: 1 }} justify="end">
        <Input
          label="GP Fee Amount"
          value={formatCurrency(calculatedFields.gpFeeDollarAmount, dealCurrencyCode)}
          readOnly
          precision={2}
        />
        <Input
          label="Initial Year Amount Override"
          value={localInputs.initialYearAmountOverride}
          onChange={(e) => handleInputChange('initialYearAmountOverride', e)}
          onBlur={(e) => handleInputChange('initialYearAmountOverride', e)}
          precision={2}
        />
        <Input
          label="Initial Year GP Override"
          value={localInputs.initialYearGpOverride}
          onChange={(e) => handleInputChange('initialYearGpOverride', e)}
          onBlur={(e) => handleInputChange('initialYearGpOverride', e)}
          precision={2}
        />
        <Input
          label="Country"
          value={localInputs.country || dealCompanyCountry}
          onChange={(e) => handleInputChange('country', e)}
          onBlur={(e) => handleInputChange('country', e)}
          precision={2}
        />
      </Flex>
    </Flex>
  );
};
