const { login, logout } = require('../controllers/authController');


module.exports = (app) => {
    app.post('/api/login', login);
    app.post('/api/logout', logout);
};