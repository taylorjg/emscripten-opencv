const express = require('express')
const path = require('path')

const PORT = process.env.PORT || 3092
const DIST_FOLDER = path.resolve(__dirname, '..')

const app = express()
app.use(express.static(DIST_FOLDER))
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))
