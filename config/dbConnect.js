const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`Connected to DB`);
  } catch (err) {
    console.log(`Error while connecting to DB : ${err.message}`);
    process.exit(1);
  }
};

dbConnect();
