const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const PORT = process.env.PORT || 3001

//Models
const Person = require('./models/person')

//Middleware
const morgan = require('morgan')

app.use(cors())
app.use(express.json()) // for request.body to work
app.use(express.static('build'))

morgan.token('body', (req) => {
    const body = JSON.stringify(req.body)
    if (body === JSON.stringify({})) {
        return ''
    }
    else {
        return body
    }
})
app.use(morgan(':method :url :status :req[body] - :response-time ms :body'))

//Methods
const generateId = () => {
    let id = Math.floor(Math.random() * Math.floor(100000))
    return id
}


//Routes
app.get('/', (req, res) => {
    res.send('Phonebook Backend')
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.post('/api/persons', (req, res) => {
    if (!req.body.name || !req.body.number) {
        return res.status(400).json({
            error: 'content missing'
        })
    }
    // if (persons.find(p => p.name === req.body.name)) {
    //     return res.status(404).json({
    //         error: 'name already exists'
    //     })
    // }
    const person = new Person({
        name: req.body.name,
        number: req.body.number,
        id: generateId()
    })

    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const person = {
        name: req.body.name,
        number: req.body.number,
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

app.get('/info', (req, res) => {
    Person.find({}).then(results => {
        res.send(`Phonebook has info for ${results.length} people` + "\n" + new Date())
    })
})


//Error Handler
const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

app.listen(PORT, () => {
    console.log("Phonebook backend!")
})