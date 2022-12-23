const express = require('express')
const router = express.Router()
const { getPlaceById, getPlacesByUserId, createPlace, updatePlace, deletePlace } = require('../controllers/places-controller')

router.get('/:pid', getPlaceById)

router.get('/user/:uid', getPlacesByUserId)

router.post('/', createPlace)

router.patch('/:pid', updatePlace)

router.delete('/:pid', deletePlace)

module.exports = router