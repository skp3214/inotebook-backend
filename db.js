const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://skprajapati3214:Sachin3214@backend-cluster.qfpxr0l.mongodb.net/iNoteBook?retryWrites=true&w=majority";


const connectToMongo = () => {
    mongoose.connect(mongoURI);

    mongoose.connection.on('connected', () => {
        console.log("Connected to MongoDB");
    });
}

module.exports = connectToMongo;
