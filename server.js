const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const labTestRoutes = require('./src/routes/labTest');
const testResultRoutes = require('./src/routes/testResult.routes');



dotenv.config();
const app = express();


app.use(bodyParser.json());    // middleware


app.use('/api/lab-tests', labTestRoutes); // this for routes
app.use('/api/lab', testResultRoutes);

// MongoDB Connection code
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB Connection Error:", err));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
