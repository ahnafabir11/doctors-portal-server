require('dotenv').config()
const cors = require('cors')
const fs = require('fs-extra')
const express = require('express')
const fileUpload = require('express-fileupload')

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(fileUpload())
app.use(express.json())
app.use(express.static('doctors'))
app.use(express.urlencoded({extended: false}))

app.get('/', (req, res) => {
  res.send('Hello World!')
})


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.swwce.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db(`${process.env.DB_NAME}`).collection("appointments");
  const doctorsCollection = client.db(`${process.env.DB_NAME}`).collection("doctors");

  app.post('/addAppointment', (req, res) => {
    const appointmentData = req.body;
    appointmentCollection.insertOne(appointmentData)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })

  app.post('/appointmentsByDate', (req, res) => {
    const date = req.body.date;
    const email = req.body.email;

    doctorsCollection.find({email: email})
      .toArray((err, doctors)=> {
        if(doctors.length === 0) {
          appointmentCollection.find({ date, email })
            .toArray((err, appointments) => {
              res.send(appointments)
            })
        } else {
          appointmentCollection.find({ date })
            .toArray((err, appointments) => {
              res.send(appointments)
            })
        }
      })
    
  })

  app.get('/appointments', (req, res) => {
    appointmentCollection.find()
    .toArray((err, appointments)=> {
      res.send(appointments);
    })
  })

  app.post('/addADoctor', (req, res) => {
    const {name, email} =  req.body;
    const file = req.files.file;
    const filePath = `${__dirname}/doctors/${file.name}`;
    
    file.mv(filePath, (err)=> {
      res.status(500).send({msg: 'Failed To Upload Image'})
    })

    const newImg = fs.readFileSync(filePath);
    const encImg = newImg.toString('base64');
    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    }

    doctorsCollection.insertOne({name, email, image})
      .then(result => {
        fs.remove(filePath)
      })
  })

  app.get('/doctors', (req, res) => {
    doctorsCollection.find()
    .toArray((err, doctors)=> {
      res.send(doctors)
    })
  })

});


app.listen(port)