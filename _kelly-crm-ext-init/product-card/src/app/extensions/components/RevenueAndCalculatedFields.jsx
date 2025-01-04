import { useState } from 'react';
import { useEffect } from 'react';

import { Flex } from '@hubspot/ui-extensions';

import { Input } from '@hubspot/ui-extensions';

const FLEX_GAP = 'small';
export const RevenueAndCalculatedFields = ({ inputs = {}, onInputChange, dealStartDate, dealCompanyCountry }) => {
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
    setLocalInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
    onInputChange(name, value); // Pass to parent
  };

  const calculateFields = () => {
    const annualRevenueAmount = parseFloat(localInputs.annualRevenueAmount) || 0;
    const gpFeePercent = parseFloat(localInputs.gpFeePercent) || 0;

    const yearProgressDaysTodayOnStartDate =
      (new Date(dealStartDate) - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24);
    const currentYear = new Date(dealStartDate).getFullYear();
    const daysInYear = (new Date(currentYear, 11, 31) - new Date(currentYear, 0, 0)) / (1000 * 60 * 60 * 24);

    const initialYearAmount = ((yearProgressDaysTodayOnStartDate / daysInYear) * annualRevenueAmount).toFixed(2);
    const initialYearGpFee = (initialYearAmount * (gpFeePercent / 100)).toFixed(2);
    const gpFeeDollarAmount = (annualRevenueAmount * (gpFeePercent / 100)).toFixed(2);

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

  const formatDollars = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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
        />
        <Input
          label="GP Fee Percent"
          value={localInputs.gpFeePercent}
          onChange={(e) => handleInputChange('gpFeePercent', e)}
          onBlur={(e) => handleInputChange('gpFeePercent', e)}
        />
        <Input label="Initial Year Amount" value={formatDollars(calculatedFields.initialYearAmount)} readOnly />
        <Input label="Initial Year GP Fee" value={formatDollars(calculatedFields.initialYearGpFee)} readOnly />
        <Input
          label="Markup Percent"
          value={localInputs.markupPercent}
          onChange={(e) => handleInputChange('markupPercent', e)}
          onBlur={(e) => handleInputChange('markupPercent', e)}
        />
      </Flex>

      {/* Right Column */}
      <Flex direction="column" gap={FLEX_GAP} style={{ flex: 1 }} justify="end">
        <Input label="GP Fee Amount" value={formatDollars(calculatedFields.gpFeeDollarAmount)} readOnly />
        <Input
          label="Initial Year Amount Override"
          value={localInputs.initialYearAmountOverride}
          onChange={(e) => handleInputChange('initialYearAmountOverride', e)}
          onBlur={(e) => handleInputChange('initialYearAmountOverride', e)}
        />
        <Input
          label="Initial Year GP Override"
          value={localInputs.initialYearGpOverride}
          onChange={(e) => handleInputChange('initialYearGpOverride', e)}
          onBlur={(e) => handleInputChange('initialYearGpOverride', e)}
        />
        <Input
          label="Country"
          value={localInputs.country || dealCompanyCountry}
          onChange={(e) => handleInputChange('country', e)}
          onBlur={(e) => handleInputChange('country', e)}
        />
      </Flex>
    </Flex>
  );
};
