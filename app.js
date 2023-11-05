require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const { PORT } = process.env;

const mediaRouter = require('./routes/media.routes');
const userRouter = require('./routes/user.routes');

app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    return res.json({
        status: true,
        message: '## WELCOME TO ART GALLERY ##',
        err: null,
        data: null
    })
})

app.use('/api/v1/users', userRouter);
app.use('/api/v1/media', mediaRouter);

app.listen(PORT, console.log(`listening on port ${PORT}`));