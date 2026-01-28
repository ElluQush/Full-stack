import { useState, useEffect } from 'react'
import Filter from './components/Filter'
import Notification from './components/Notification'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import personService from './services/persons'

const App = () => {
    const [persons, setPersons] = useState([])
    const [newName, setNewName] = useState('')
    const [newNumber, setNewNumber] = useState('')
    const [newFilter, setNewFilter] = useState('')
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        personService
            .getAll()
            .then(initialPersons => {
                setPersons(initialPersons)
            })
    }, [])

    const addPerson = (event) => {
        event.preventDefault()

        if (persons.some(p => p.name === newName)) {
            const person = persons.find(p => p.name === newName)

            if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
                const changedPerson = { ...person, number: newNumber }

                personService
                    .update(person.id, changedPerson)
                    .then(response => {
                        setPersons(persons.map(p => p.id === person.id ? response : p))
                        setNotification({
                            message: `Updated ${response.name}`,
                            type: 'success'
                        })
                        setTimeout(() => {
                            setNotification(null)
                        }, 3000)
                        setNewName('')
                        setNewNumber('')
                    })
                    .catch(error => {
                        setNotification({
                            message: `Information of ${changedPerson.name} has already been removed from server`,
                            type: 'error'
                        })
                        setTimeout(() => {
                            setNotification(null)
                        }, 3000)
                    })
            }
            return
        }

        const personObject = {
            name: newName,
            number: newNumber,
            id: String(persons.length + 1),
        }

        personService
            .create(personObject)
            .then(returnedPerson => {
                setPersons(persons.concat(returnedPerson))
                setNotification({
                    message: `Added ${returnedPerson.name}`,
                    type: 'success'})
                setTimeout(() => {
                    setNotification(null)
                }, 3000)
                setNewName('')
                setNewNumber('')
            })
    }

    const deletePerson = id => {
        const person = persons.find(p => p.id === id)
        if (!window.confirm(`Delete ${person.name}?`)) {
            return
        }

        personService
            .remove(id)
            .then(() => {
                setPersons(persons.filter(p => p.id != id))
            })
            .catch(error => {
                alert(
                    `the person '${person.id}' was already deleted from server`
                )
                setPersons(persons.filter(p => p.id !== id))
            })
    }

    const handleNameChange = (event) => {
        setNewName(event.target.value)
    }

    const handleNumberChange = (event) => {
        setNewNumber(event.target.value)
    }

    const handleFilterChange = (event) => {
        setNewFilter(event.target.value)
    }

    const showPerson = persons.filter(person =>
        person.name.toLowerCase().includes(newFilter.toLocaleLowerCase())
    )

    return (
        <div>
            <h2>Phonebook</h2>
            {notification && <Notification notification={notification} />}
            <Filter
                value={newFilter}
                onChange={handleFilterChange}
            />

            <h2>add a new</h2>
            <PersonForm
                onSubmit={addPerson}
                newName={newName}
                newNumber={newNumber}
                handleNameChange={handleNameChange}
                handleNumberChange={handleNumberChange}
            />

            <h2>Numbers</h2>
            <Persons
                persons={showPerson}
                deletePerson={deletePerson} />
        </div>
    )
}

export default App