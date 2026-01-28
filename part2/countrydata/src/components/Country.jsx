const Country = ({ country }) => {
    if (!country) {
        return null
    }

    const languages = Object.values(country.languages)

    return (
        <div>
            <h1>{country.name.common}</h1>
            Capital {country.capital}<br />
            Area {country.area}

            <h2>Languages</h2>
            <ul>
                {languages.map(language => (
                    <li key={language}>{language}</li>
                ))}
            </ul>

            <img
                src={country.flags.png}
                alt={country.flags.alt}
            />
        </div>
    )
}

export default Country