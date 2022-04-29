module.exports.signUpErrors = (err) => {
    let errors = { username: "", email: "", password: "" };
  
    if (err.message.includes("username"))
      errors.username = "Username is already taken, contains invalid characters, or minimum length of 3 characters is not reached";
  
    if (err.message.includes("email")) errors.email = "Invalid email format";
  
    if (err.message.includes("password"))
      errors.password = "Password requires a minimum of 6 characters";
  
    if (err.code === 11000 && Object.keys(err.keyValue)[0].includes("username"))
      errors.username = "This username has been taken";
  
    if (err.code === 11000 && Object.keys(err.keyValue)[0].includes("email"))
      errors.email = "This email is already registed with another account";
  
    return errors;
  };
  
  module.exports.loginErrors = (err) => {
    let errors = { email: '', password: ''}
  
    if (err.message.includes("email")) 
      errors.email = "Invalid email";
    
    if (err.message.includes('password'))
      errors.password = "Invalid password"
  
    return errors;
  }
  
  module.exports.uploadErrors = (err) => {
    let errors = { format: '', maxSize: ""};
  
    if (err.message.includes('Invalid file format'))
      errors.format = "Invalid file format";
  
    if (err.message.includes('Maximum file size exceeded'))
      errors.maxSize = "File cannot be > 500mb";
  
    return errors
  }