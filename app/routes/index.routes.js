module.exports = app => {
    const router = require("express").Router();
    const invoices = require('./invoices');
    const subscriptions = require('./subscriptions');
    const users = require('./users');

    const Authorization = require('../auth/authorization');

    router.use('/invoices', invoices);
    router.use('/subscriptions', subscriptions);
    router.use('/users', users);

    app.use('/api', router);
};
