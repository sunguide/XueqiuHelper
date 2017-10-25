module.exports = app => {
  const mongoose = app.mongoose;
  const UserSchema = new mongoose.Schema({
    userName: { type: String  },
    password: { type: String  }
  });

  return mongoose.model('XueqiuUser', UserSchema);
}
