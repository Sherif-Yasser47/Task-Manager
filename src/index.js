const express = require('express');
const userRouter = require('./routers/userRouter');
const taskRouter = require('./routers/taskRouter');
const listRouter = require('./routers/listRouter');
require('./db/mongoose');

const app = express();
const port = process.env.PORT

app.use(express.json())
app.use(userRouter);
app.use(taskRouter);
app.use(listRouter);

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
})
