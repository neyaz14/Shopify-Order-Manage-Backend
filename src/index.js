require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');

const connectDB = require('./connectdb');
const userRoutre = require('./routes/userRoute');
const authRouter = require('./routes/authRoutes');


// ! ------------------------------

const fetchOdersData = require('./routes/fetchOdersDataRoute')

const pathaoOrder = require('./routes/pathaoRoute')
const steadfastOrder = require('./routes/steadfastRoute')
const addTagsOrder = require('./routes/addTagsOrder')
const addFulfillments = require('./routes/addFulfillments')


const pathaoZoneMatch = require('./routes/pathaoZoneMatchRoute')
const pathaoZoneLevenshtein  = require('./routes/pathaoZoneLevenshtein')
const arrayStyleMatch  = require('./routes/pathaoZoneMatch/arrayStyle')

// ! --------------
const { graphqlHTTP } = require('express-graphql');
const GSchema = require('./GraphqlSchema/mainSchema')
// ! -----
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
// ! -------------------

const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());

app.use(cors({
    origin: [
        'http://localhost:5173',
    ],
    credentials: true
}));


connectDB();
app.use('/graphql/userStore', graphqlHTTP({
    schema:GSchema,
    graphiql: process.env.NODE_ENV === 'development'
}))


app.use('/',userRoutre)



// ! -----------------------------


app.use(cookieParser());


app.post('/jwt', (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' });
    // console.log(user,'--: : --' )

    res
        .cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: '/'  // Ensure cookie is removed from all paths
        })
        .send({ success: true })

});

app.post('/logout', (req, res) => {
    // console.log('loggedout ---!! ')
    res
        .clearCookie('token', {
            httpOnly: true,
            secure:false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: '/'  // Ensure cookie is removed from all paths
        })
        .send({ message: 'cookie cleared' })
})








// app.use('/', SOrders)
app.use('/', fetchOdersData)
app.use('/', pathaoOrder)
app.use('/', steadfastOrder)
app.use("/api/shopify", addTagsOrder);
app.use("/", pathaoZoneMatch);
app.use("/", pathaoZoneLevenshtein);
app.use("/", arrayStyleMatch);
app.use('/',addFulfillments)

// app.use('/', shopifyOrderRoute)





















app.get('/', (req, res) => {
  res.send('Our server is ready -------- ......... ')
})

app.listen(port, () => {
  console.log(`server is sitting on port ${port}`);
})
