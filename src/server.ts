import app from './app';

const port = process.env.port || 7100

app.listen(port, () => {
    console.log(`Server  is running on port ${port}`)
})
