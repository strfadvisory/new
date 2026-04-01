import React from 'react';

interface MasterDataProps {
  year: number | string;
  value: string | number;
  isPositive: boolean;
  displayUnits: number | string;
  displayMonthlyFee: number | string;
  displayOpeningBalance: string;
  displayContributions: string;
  displayInterest: string;
  displayExpenses: string;
  displayFundingRatio: string;
  displayCumContrib: string;
  startingBalance: number;
  isEditingUnits: boolean;
  calculatedYearPriorityTotal: number;
  popupYearBeingEdited: number | null;
  onToggle: () => void;
  onUnitsEdit: () => void;
  onUnitsSave: () => void;
  onUnitsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUnitsKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFeeClick: () => void;
  onYearPriorityClick: () => void;
  feeValueRef: React.RefObject<HTMLSpanElement>;
  yearPriorityValueRef: React.RefObject<HTMLSpanElement>;
  unitsInputRef: React.RefObject<HTMLInputElement>;
}

const MasterData: React.FC<MasterDataProps> = ({
  year,
  value,
  isPositive,
  displayUnits,
  displayMonthlyFee,
  displayOpeningBalance,
  displayContributions,
  displayInterest,
  displayExpenses,
  displayFundingRatio,
  displayCumContrib,
  startingBalance,
  isEditingUnits,
  calculatedYearPriorityTotal,
  popupYearBeingEdited,
  onToggle,
  onUnitsEdit,
  onUnitsSave,
  onUnitsChange,
  onUnitsKeyDown,
  onFeeClick,
  onYearPriorityClick,
  feeValueRef,
  yearPriorityValueRef,
  unitsInputRef,
}) => {
  return (
    <>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', margin: '0' }}>{year}</h2>
        <button
          onClick={onToggle}
          style={{
            width: '30px',
            height: '30px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img src='/expend.png' alt="toggle" />
        </button>
      </div>

      {/* Main Value Section */}
      <div style={{ padding: '20px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
          {isPositive ? 'Remaining Surplus' : 'Deficit Amount'}
        </div>
        <div style={{ fontSize: '32px', fontWeight: '700', color: isPositive ? '#10b981' : '#dc3545', marginBottom: '20px' }}>
          {value}
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', color: '#374151' }}>Total Housing Units</span>
          {isEditingUnits ? (
            <input
              ref={unitsInputRef}
              type="number"
              value={displayUnits}
              onChange={onUnitsChange}
              onBlur={onUnitsSave}
              onKeyDown={onUnitsKeyDown}
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#10b981',
                border: '1px solid #10b981',
                borderRadius: '4px',
                padding: '4px 8px',
                width: '80px',
                textAlign: 'right',
              }}
            />
          ) : (
            <span
              onClick={onUnitsEdit}
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#10b981',
                cursor: 'pointer',
                textDecoration: 'underline',
                textDecorationStyle: 'dashed',
                textUnderlineOffset: '3px',
              }}
              title="Click to edit Total Housing Units"
            >
              {displayUnits}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', color: '#374151' }}>Monthly Fee</span>
          <span
            ref={feeValueRef}
            onClick={onFeeClick}
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#10b981',
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationStyle: 'dashed',
              textUnderlineOffset: '3px',
            }}
            title="Click to adjust Monthly Fee"
          >
            ${displayMonthlyFee}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', color: '#374151' }}>Year Priority</span>
          <span
            ref={yearPriorityValueRef}
            onClick={onYearPriorityClick}
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#10b981',
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationStyle: 'dashed',
              textUnderlineOffset: '3px',
            }}
            title="Click to manage priorities"
          >
            {popupYearBeingEdited === year && calculatedYearPriorityTotal > 0 ? `$${calculatedYearPriorityTotal.toLocaleString()}` : displayExpenses}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '14px', color: '#374151' }}>Loans & Assessments</span>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#10b981', textDecoration: 'underline' }}>0.0</span>
        </div>
      </div>

      {/* Others Details Section */}
      <div style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Others Details</h3>

        {[
          { label: 'Opening Balance',         value: displayOpeningBalance },
          { label: 'Annual Contributions',    value: displayContributions },
          { label: 'Investment Return',        value: displayInterest },
          { label: 'Expenses This Year',       value: displayExpenses },
          { label: 'Funding Ratio',            value: displayFundingRatio },
          { label: 'Cumulative Contributions', value: displayCumContrib },
          { label: 'Total Housing Units',     value: displayUnits || '0' },
          { label: 'Starting Balance (Config)', value: `$${startingBalance.toLocaleString()}` },
        ].map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '14px', color: '#374151' }}>{item.label}</span>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default MasterData;
