const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
mongoose.Promise = require('bluebird');

//Declaring userSchema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String }
});

userSchema.plugin(require('mongoose-unique.validator'));

userSchema.set('toJSON', {
  transform(doc, json) {
    delete json.password;
    return json;
  }
});

userSchema.methods.validatePassword = function validatePassword(password){
  return bcrypt.compareSync(password, this.password);
};

userSchema
  .virtual('passwordconfirmation')
  .set(function setPasswordConfirmation(passwordConfirmation){
    this._passwordConfirmation = passwordConfirmation;
  });


userSchema.pre('validate', function checkPassword(next){
  if(!this.password) {
    this.invalidate('password', 'password is required');
  }
  if(this.isModified('password') && this._passordCofirmation !== this.password){
    this.invalidate('passwordConfirmation', 'does not match');
  }
  next();
});

userSchema.pre('save', function hashPasword(next){
  if(this.isModified('password')){
    this.password = bcrypt.hashSync(this.pasword, bcrypt.genSaltSync(8));
  }
  next();
});

module.exports = mongoose.model('User', userSchema);