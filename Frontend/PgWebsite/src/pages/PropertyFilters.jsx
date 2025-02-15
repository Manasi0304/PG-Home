import { useState } from "react";
import "./PropertyFilters.css";

function PropertyFilters({ filters = {}, setFilters }) {
    const [showLocality, setShowLocality] = useState(false);
    const [showTenantType, setShowTenantType] = useState(false);

    const allLocalities = [
        "Akurdi", "Aundh", "Balewadi", "Baner", "Dhankawadi",
        "Fursungi", "Hadapsar", "Hinjewadi", "Karve Nagar", "Katraj",
        "Pimple Saudagar", "Shivajinagar", "Viman Nagar", "Wakad", "Kondhwa"
    ];

    const allTenantTypes = ["Girls", "Boys", "Family", "Working Professionals"];
    const allRentingOptions = ["Private", "Twin Sharing", "Triple Sharing", "Dormitory", "Monthly", "Yearly"];
    const allServices = ["Mess", "Gym", "Swimming Pool", "Security"];

    const handleFilterChange = (key, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [key]: value
        }));
    };

    const handleMultiSelectChange = (event, key) => {
        const selected = Array.from(event.target.selectedOptions, (option) => option.value.toLowerCase());
        setFilters((prevFilters) => ({
            ...prevFilters,
            [key]: selected
        }));
    };

    const handleMultiCheckboxChange = (event, key) => {
        const { value, checked } = event.target;
        setFilters((prevFilters) => {
            const updatedSelection = checked
                ? [...(prevFilters[key] || []), value]
                : (prevFilters[key] || []).filter((item) => item !== value);

            return { ...prevFilters, [key]: updatedSelection };
        });
    };

    return (
        <div className="filter-section">
            <div className="filter-box">
                <div className="filter-header" onClick={() => setShowLocality(!showLocality)}>
                    Locality <span className="filter-icon">{showLocality ? "▲" : "▼"}</span>
                </div>
                {showLocality && (
                    <div className="filter-body">
                        {allLocalities.map((loc, index) => (
                            <div key={index} className="filter-option">
                                <input
                                    type="radio"
                                    id={`locality-${index}`}
                                    name="locality"
                                    value={loc}
                                    checked={filters?.locality === loc}
                                    onChange={(e) => handleFilterChange("locality", e.target.value)}
                                />
                                <label htmlFor={`locality-${index}`}>{loc}</label>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="filter-box">
                <div className="filter-header" onClick={() => setShowTenantType(!showTenantType)}>
                    Tenant Type <span className="filter-icon">{showTenantType ? "▲" : "▼"}</span>
                </div>
                {showTenantType && (
                    <div className="filter-body">
                        {allTenantTypes.map((type, index) => (
                            <div key={index} className="filter-option">
                                <input
                                    type="radio"
                                    id={`tenant-${index}`}
                                    name="tenantType"
                                    value={type}
                                    checked={filters?.tenantType === type}
                                    onChange={(e) => handleFilterChange("tenantType", e.target.value)}
                                />
                                <label htmlFor={`tenant-${index}`}>{type}</label>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <input
                type="number"
                placeholder="Max Budget (₹)"
                value={filters?.budget ?? ""}
                onChange={(e) => handleFilterChange("budget", e.target.value)}
            />

            <select multiple onChange={(e) => handleMultiSelectChange(e, "rentingOption")}>
                {allRentingOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                ))}
            </select>

            <select multiple onChange={(e) => handleMultiSelectChange(e, "services")}>
                {allServices.map((service, index) => (
                    <option key={index} value={service}>{service}</option>
                ))}
            </select>
        </div>
    );
}

export default PropertyFilters;
