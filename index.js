require('dotenv').config()
const cors = require('cors')
const express = require('express')

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.get('/', (req, res) => {
  res.send('Hello World!')
})


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.swwce.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db(`${process.env.DB_NAME}`).collection("appointments");

  app.post('/addAppointment', (req, res) => {
    const appointmentData = req.body;
    appointmentCollection.insertOne(appointmentData)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })

  app.post('/appointmentsByDate', (req, res) => {
    const date = req.body.date;
       
    appointmentCollection.find({date})
    .toArray((err, appointments)=> {
      res.send(appointments)
    })
  })

  app.get('/appointments', (req, res) => {
    appointmentCollection.find()
    .toArray((err, appointments)=> {
      res.send(appointments);
    })
  })

});


app.listen(port, () => console.log(`Server Running at http://localhost:${port}`))