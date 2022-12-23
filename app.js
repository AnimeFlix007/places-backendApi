const express = require("express");
const HttpError = require("./models/http-error");
const mongoose = require("mongoose");

const placeRoutes = require("./routes/places-routes");
const userRoutes = require("./routes/users-routes");

const app = express();
const PORT = 5000;

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Auhorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE"
  );
  next();
});

app.use("/api/places", placeRoutes);
app.use("/api/users", userRoutes);

// page not found
app.use((req, res, next) => {
  const error = new HttpError("Page not Found", 404);
  return next(error);
});

// error handler
app.use((err, req, res, next) => {
  if (res.headetSent) {
    return next(err);
  }
  res.status(err.status || 500);
  res.json({
    message: err.message || "Internal server error",
  });
});

mongoose
  .connect(
    `mongodb+srv://devjit:devjitbose@mern-places.rsspcqv.mongodb.net/mern-place?retryWrites=true&w=majority`
  )
  .then(({ connection }) => {
    console.log("db connected : " + connection.host);
    app.listen(PORT, () => {
      console.log(`server listening on : ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });
