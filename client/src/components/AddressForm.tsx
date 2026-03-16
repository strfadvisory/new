import React, { useState } from 'react';

interface AddressData {
  zipCode: string;
  state: string;
  city: string;
  address1: string;
  address2: string;
}

interface AddressFormProps {
  addressData: AddressData;
  onAddressChange: (addressData: AddressData) => void;
  showUseMyAddress?: boolean;
  useMyAddress?: boolean;
  onUseMyAddressChange?: (checked: boolean) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  addressData,
  onAddressChange,
  showUseMyAddress = false,
  useMyAddress = false,
  onUseMyAddressChange
}) => {
  const [loadingZip, setLoadingZip] = useState(false);
  const [zipError, setZipError] = useState<string>('');

  const usStates = [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
  ];

  const fetchLocationByZip = async (zipCode: string) => {
    setLoadingZip(true);
    setZipError('');
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      if (response.ok) {
        const data = await response.json();
        if (data.places && data.places.length > 0) {
          const place = data.places[0];
          const newAddressData = {
            ...addressData,
            state: place['state abbreviation'],
            city: place['place name']
          };
          onAddressChange(newAddressData);
          setZipError(''); // Clear error on success
        } else {
          // Data found but no places - show error but keep ZIP code
          setZipError('ZIP code information not available. Please enter address details manually.');
        }
      } else {
        // API returned error - show message but keep ZIP code intact
        setZipError('ZIP code not found. Please enter address details manually.');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      // Keep ZIP code field intact even on error
      setZipError('Could not lookup ZIP code. Please enter address details manually.');
    } finally {
      setLoadingZip(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newAddressData = {
      ...addressData,
      [name]: value
    };
    onAddressChange(newAddressData);
  };

  const handleZipBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const zipValue = e.target.value;
    // Only fetch if exactly 5 digits are entered
    if (zipValue.length === 5 && /^[0-9]{5}$/.test(zipValue)) {
      fetchLocationByZip(zipValue);
    } else if (zipValue.length > 0 && zipValue.length < 5) {
      // Show warning if user entered incomplete ZIP code
      setZipError('Please enter a complete 5-digit ZIP code.');
    } else if (zipValue.length === 0) {
      // Clear error if field is empty
      setZipError('');
    }
  };

  return (
    <>
      <div className="section-title mt-4">
        <h3>Add your Address</h3>
        <p>Enter a 5-digit ZIP code to automatically fill City and State, or manually provide all address details.</p>
      </div>
      
      {showUseMyAddress && (
        <div className="form-group">
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="useMyAddress" 
              checked={useMyAddress}
              onChange={(e) => onUseMyAddressChange?.(e.target.checked)}
            />
            <label htmlFor="useMyAddress">
              Use My Address
            </label>
          </div>
        </div>
      )}
      
      <div className="row g-4">
        <div className="col-md-12">
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              name="zipCode"
              value={addressData.zipCode}
              onChange={handleInputChange}
              onBlur={handleZipBlur}
              maxLength={5}
              pattern="[0-9]*"
              placeholder="Zip Code (5 digits for auto-fill)"
              style={{width: '100%'}}
            />
            {loadingZip && <div className="text-muted small mt-1"><i className="fas fa-spinner fa-spin"></i> Loading city and state...</div>}
            {zipError && <div className="text-warning small mt-1"><i className="fas fa-exclamation-circle"></i> {zipError}</div>}
          </div>
        </div>
        <div className="col-md-12">
          <div className="form-group">
            <select
              className="form-input"
              name="state"
              value={addressData.state}
              onChange={handleInputChange}
              style={{width: '100%'}}
            >
              <option value="">State</option>
              {usStates.map(state => (
                <option key={state.code} value={state.code}>{state.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="form-group">
        <input
          type="text"
          className="form-input"
          name="city"
          value={addressData.city}
          onChange={handleInputChange}
          placeholder="City"
          style={{width: '100%'}}
        />
      </div>
      
      <div className="form-group">
        <input
          type="text"
          className="form-input"
          name="address1"
          value={addressData.address1}
          onChange={handleInputChange}
          placeholder="Address 1"
          style={{width: '100%'}}
        />
      </div>
      
      <div className="form-group">
        <input
          type="text"
          className="form-input"
          name="address2"
          value={addressData.address2}
          onChange={handleInputChange}
          placeholder="Address 2"
          style={{width: '100%'}}
        />
      </div>
    </>
  );
};

export default AddressForm;