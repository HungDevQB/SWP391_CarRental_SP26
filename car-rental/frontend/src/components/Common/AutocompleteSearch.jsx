import React, { useState, useRef, useEffect } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { createPortal } from "react-dom";

export default function AutocompleteSearch({ fetchSuggestions, onSelect, value, onChange, inputClassName, placeholder }) {
  const [query, setQuery] = useState(value || "");
  const [completion, setCompletion] = useState("");
  const [showCompletion, setShowCompletion] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Đồng bộ query với prop value nếu controlled
  useEffect(() => {
    if (typeof value === "string" && value !== query) setQuery(value);
  }, [value]);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      setIsLoading(true);
      fetchSuggestions(debouncedQuery)
        .then((res) => {
          setSuggestions(res);
          setIsOpen(true);
          setSelectedIndex(-1);
          setError(null);
        })
        .catch(() => setError("Error fetching suggestions"))
        .finally(() => setIsLoading(false));
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setCompletion("");
      setShowCompletion(false);
    }
  }, [debouncedQuery, fetchSuggestions]);

  useEffect(() => {
    if (suggestions.length > 0 && query.trim()) {
      const firstMatch = suggestions.find((s) =>
        s.toLowerCase().startsWith(query.toLowerCase())
      );
      if (firstMatch && query.length > 0) {
        setCompletion(firstMatch.slice(query.length));
        setShowCompletion(true);
      } else {
        setCompletion("");
        setShowCompletion(false);
      }
    } else {
      setCompletion("");
      setShowCompletion(false);
    }
  }, [suggestions, query]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (onChange) onChange(e.target.value);
    setShowCompletion(false);
    setCompletion("");
  };

  const handleClear = () => {
    setQuery("");
    if (onChange) onChange("");
    setCompletion("");
    setShowCompletion(false);
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion);
    if (onSelect) onSelect(suggestion);
    if (onChange) onChange(suggestion);
    setCompletion("");
    setShowCompletion(false);
    setIsOpen(false);
    setSuggestions([]);
  };

  const acceptCompletion = () => {
    if (completion && showCompletion) {
      const completed = query + completion;
      setQuery(completed);
      if (onSelect) onSelect(completed);
      if (onChange) onChange(completed);
      setCompletion("");
      setShowCompletion(false);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Tab" || e.key === "ArrowRight") && showCompletion && completion) {
      e.preventDefault();
      acceptCompletion();
      return;
    }
    if (!isOpen || suggestions.length === 0) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else if (showCompletion && completion) {
          acceptCompletion();
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        setShowCompletion(false);
        setCompletion("");
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex];
      selectedElement?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  // Tính toán vị trí dropdown khi mở
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "absolute",
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 2147483647
      });
    }
  }, [isOpen, suggestions, query]);

  // Đóng dropdown khi click ngoài (sửa lại để không đóng khi click vào dropdown)
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        !(document.getElementById('autocomplete-dropdown') && document.getElementById('autocomplete-dropdown').contains(e.target))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  return (
    <div className="relative w-full">
      <div className="relative">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {/* icon */}
        </div>
        {/* Autocomplete background text */}
        {showCompletion && completion && (
          <div className="absolute inset-0 pl-12 pr-12 py-4 text-lg pointer-events-none flex items-center">
            <span className="invisible">{query}</span>
            <span className="text-gray-400 bg-gray-100 px-1 rounded">{completion}</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder={placeholder || "Tìm theo tên xe/hãng xe..."}
          className={inputClassName || "w-full pl-12 pr-12 py-4 text-lg border border-gray-200 rounded-2xl bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 relative z-10"}
          style={{ backgroundColor: "transparent" }}
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
          {isLoading && <span>Loading...</span>}
          {query && !isLoading && (
            <button onClick={handleClear} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              X
            </button>
          )}
        </div>
        {showCompletion && completion && (
          <div className="absolute top-full left-0 mt-1 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm border">
            Press Tab or → to complete
          </div>
        )}
      </div>
      {isOpen && createPortal(
        <div id="autocomplete-dropdown" style={dropdownStyle} className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          {error && (
            <div className="p-4 text-red-600 text-sm border-b border-gray-100">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}
          {suggestions.length > 0 && (
            <ul ref={listRef} className="max-h-80 overflow-y-auto">
              {suggestions.map((suggestion, index) => {
                const lowerSuggestion = suggestion.toLowerCase();
                const lowerQuery = query.toLowerCase();
                const matchIndex = lowerSuggestion.indexOf(lowerQuery);
                return (
                  <li key={index}>
                    <button
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-b-0 ${
                        selectedIndex === index ? "bg-blue-50 text-blue-700" : ""
                      }`}
                    >
                      <span className="truncate">
                        {matchIndex === -1 ? (
                          suggestion
                        ) : (
                          <>
                            {suggestion.slice(0, matchIndex)}
                            <span className="font-medium text-blue-600">
                              {suggestion.slice(matchIndex, matchIndex + query.length)}
                            </span>
                            {suggestion.slice(matchIndex + query.length)}
                          </>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {!isLoading && suggestions.length === 0 && query.trim() && (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">No suggestions found for "{query}"</p>
            </div>
          )}
          {suggestions.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t border-gray-100">
              Use ↑↓ to navigate, Tab/→ to complete, Enter to select, Esc to close
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
} 