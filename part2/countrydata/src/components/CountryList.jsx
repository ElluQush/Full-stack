const CountryList = ({ showCountry, handleShow }) => {
    return (
        <div>
            {showCountry.map(country => (
                <div key={country.cca3}>
                    {country.name.common}
                    <button onClick={() => handleShow(country.name.common)}>show</button>
                </div>
            ))}
        </div>
    )
}

export default CountryList