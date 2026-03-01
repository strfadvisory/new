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
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      if (response.ok) {
        const data = await response.json();
        const place = data.places[0];
        const newAddressData = {
          ...addressData,
          state: place['state abbreviation'],
          city: place['place name']
        };
        onAddressChange(newAddressData);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
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

    if (name === 'zipCode' && value.length === 5) {
      fetchLocationByZip(value);
    }
  };

  return (
    <>
      <div className="section-title mt-4">
        <h3>Add your Address</h3>
        <p>Provide the official location details of , including street, city, state, country, and ZIP code.</p>
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
        <div className="col-md-6">
          <div className="form-group">
            <label>Zip Code*</label>
            <input
              type="text"
              name="zipCode"
              value={addressData.zipCode}
              onChange={handleInputChange}
              maxLength={5}
              pattern="[0-9]{5}"
              placeholder="Enter 5-digit ZIP code"
              required
            />
            {loadingZip && <div className="text-muted small mt-1"><i className="fas fa-spinner fa-spin"></i> Loading...</div>}
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label>State*</label>
            <select
              name="state"
              value={addressData.state}
              onChange={handleInputChange}
              required
            >
              <option value="">Select State</option>
              {usStates.map(state => (
                <option key={state.code} value={state.code}>{state.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="form-group">
        <label>City*</label>
        <input
          type="text"
          name="city"
          value={addressData.city}
          onChange={handleInputChange}
          placeholder="City will auto-fill from ZIP code"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Address 1*</label>
        <input
          type="text"
          name="address1"
          value={addressData.address1}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Address 2</label>
        <input
          type="text"
          name="address2"
          value={addressData.address2}
          onChange={handleInputChange}
        />
      </div>
    </>
  );
};

export default AddressForm;