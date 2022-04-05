const express = require("express");
const morgan = require("morgan");
const colors = require("colors");
const dotenv = require("dotenv");
const connectDB = require("./config/mongo_connect");
const authRoute = require("./routes/auth");
const cartRoute = require("./routes/cart");

const app = express();

app.use(morgan('dev'));

app.use(express.json({}));
app.use(express.json({
    extented: true
}));

dotenv.config({
    path:'./config/config.env'
});

connectDB();

app.use("/auth", authRoute);
app.use("/cart", cartRoute);


const PORT = process.env.PORT || 7000;

app.listen(PORT, 
    console.log(`Server running on  Port :${PORT}`.magenta.underline.bold));