const express = require('express');
const router = express.Router();
const userService = require('./user.service');

// routes
router.post('/authenticate',authenticate)
router.post('/register', register);
router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', _delete);
router.post('/signout',logoff)
router.post('/audits',getAudits)



function authenticate(req, res, next) {
    console.log(req.body)
   // res.json(req.body)
  
    userService.authenticate(req)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => res.json(err));
}
function logoff(req, res, next) {
    console.log(req.body)
   // res.json(req.body)
  
    userService.signout(req)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or Token is incorrect' }))
        .catch(err => res.json(err));
}

function register(req, res, next) {
    console.log(req.body)
    userService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}
function getAudits(req, res, next) {
    userService.getAuditsList(req.body)
        .then(users => res.json(users)?res.json(users):res.status(401).json({ message: "Unauthorized access" }))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}

module.exports = router;