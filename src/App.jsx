import { useState, useEffect } from 'react'
import personService from './services/persons'


const Filter = ({value, handleChange}) => {
  return(
    <div>
      filter shown with <input value={value} onChange={handleChange} />
    </div>

  )
}


const PersonForm = ({handleSubmit, nameValue, numberValue, nameHandler, numberHandler}) => {
  return(
    <form onSubmit={handleSubmit}>
      <div>
        name: <input value={nameValue} onChange={nameHandler} />
      </div>
      <div>
        number: <input value={numberValue} onChange={numberHandler} /></div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>

  )
}


const Persons = ({personsToShow, deletePerson}) => {
  return(
    personsToShow.map(person =>
      <p key={person.name}>{person.name} {person.number}
        <button value={person.id} onClick={deletePerson}>delete</button>
      </p>
      )
    
  )
}


const SuccessNotification = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className="success">
      {message}
    </div>
  )
}


const ErrorNotification = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className="error">
      {message}
    </div>
  )
}


const App = () => {
  const [persons, setPersons] = useState([])
  const [newSearch, setNewSearch] = useState('') 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)


  useEffect(() => {
    personService
    .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])


  const addPerson = (event) => {
    event.preventDefault()
    const personObject = {
      name: newName,
      number: newNumber
    }
    let names = persons.map(person => person.name.toLowerCase())
    if (names.includes(newName.toLowerCase())) {
      updatePerson()  
    } else {
      personService
      .create(personObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setSuccessMessage(`Added ${returnedPerson.name}`)
        setTimeout(() => {
          setSuccessMessage(null)
        }, 5000)
      })
      .catch(error => {
        setErrorMessage(error.response.data.error)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      })
      
    }
    setNewName('')
    setNewNumber('')
  }


  const updatePerson = () => {
    alert(`${newName} is already added to phonebook, replace
      the old number with a new one?`);
    const personToUpdate = persons.find(person => 
      person.name.toLowerCase() === newName.toLowerCase())
    const id = personToUpdate.id
    const changedPerson = { ...personToUpdate, number: newNumber }
    personService
      .update(id, changedPerson)
      .then(returnedPerson => {
        setPersons(persons.map(person => 
          person.name.toLowerCase() !== newName.toLowerCase() ? person : returnedPerson))
        setSuccessMessage(`Number changed for ${returnedPerson.name}`)
        setTimeout(() => {
          setSuccessMessage(null)
        }, 5000)
      })
      .catch(error => {
          console.log(error)
          setErrorMessage(error.response.data.error)
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
          setPersons(persons.filter(person => person.id !== id))
      })  
  }


  const deletePerson = (event) => {
    event.preventDefault()
    let id = event.target.value
    const selected = persons.find(person => person.id.toString() === id)
    if (window.confirm(`Delete ${selected.name} ?`)) {
      personService
      .deletePerson(id)
      .then(response => {
        console.log(`Deleted person with ID ${id}, name ${selected.name}`);
        setSuccessMessage(`Deleted ${selected.name}`)
        setTimeout(() => {
          setSuccessMessage(null)
        }, 5000)
      })
      .catch(error => {
        setErrorMessage(error.response.data.error)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      })
      const isSelected = (person) => person.id.toString() !== id
      const updatedPersons = persons.filter(isSelected)
      setPersons(updatedPersons)
    }  
    
    setNewName('')
    setNewNumber('')
  }


  const personsToShow = showAll
    ? persons
    : persons.filter(person => person.name.toLowerCase().includes(newSearch.toLowerCase().trim()))


  const handleSearchChange = (event) => {
    setNewSearch(event.target.value)
    if (event.target.value !== "" )
      setShowAll(false)
  }


  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }


  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }


  return (
    <div>
      <h2>Phonebook</h2>
      <SuccessNotification message={successMessage}/>
      <ErrorNotification message={errorMessage}/>
      <Filter value={newSearch} handleChange={handleSearchChange}/>

      <h3>add a new</h3>

      <PersonForm handleSubmit={addPerson} nameValue={newName} numberValue={newNumber}
        nameHandler={handleNameChange} numberHandler={handleNumberChange}/>

      <h3>Numbers</h3>

      <Persons personsToShow={personsToShow} deletePerson={deletePerson}/>

    </div>
  )

}

export default App