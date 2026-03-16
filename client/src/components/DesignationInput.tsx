import React, { useState, useRef, useEffect } from 'react';
import { DESIGNATIONS } from '../utils/designationList';
import './DesignationInput.css';

interface DesignationInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const DesignationInput: React.FC<DesignationInputProps> = ({ value, onChange, required = false }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    // Filter suggestions based on input
    if (inputValue.trim()) {
      const filtered = DESIGNATIONS.filter(designation =>
        designation.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setHighlightedIndex(-1);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setFilteredSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  const handleInputFocus = () => {
    if (value.trim() && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="designation-input-wrapper form-group">
      <div className="designation-input-container">
        <input
          ref={inputRef}
          type="text"
          className="form-input"
          placeholder="Designation *"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          required={required}
          style={{ width: '100%' }}
          autoComplete="off"
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div ref={suggestionsRef} className="designation-suggestions">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                className={`suggestion-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignationInput;
