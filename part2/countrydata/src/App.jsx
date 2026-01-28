import { useEffect, useState } from 'react'
import Search from './components/Search'
import countryService from './services/countries'
import Country from './components/Country'
import CountryList from './components/CountryList'

const App = () => {
    const [newSearch, setSearch] = useState('')
    const [countries, setCountries] = useState([])

    const handleSearchChange = (event) => {
        setSearch(event.target.value)
    }

    const showCountry = countries.filter(country =>
        country.name.common.toLowerCase().includes(newSearch.toLowerCase())
    )

    const country = showCountry.length === 1 ? showCountry[0] : null

    const handleShow = (name) => {
        setSearch(name)
    }

    useEffect(() => {
        countryService
            .getAll()
            .then(initialCountries => {
                setCountries(initialCountries)
            })
    }, [])

    return (
        <div>
            <Search
                value={newSearch}
                onChange={handleSearchChange}
            />

            {showCountry.length > 10 && (
                <p>Too many matches, specify another filter</p>
            )}

            {showCountry.length <= 10 && showCountry.length > 1 && (
                <div>
                    <CountryList showCountry={showCountry} handleShow={handleShow} />
                </div>
            )}

            {country && <Country country={country} />}
        </div>
    )
}

export default App
