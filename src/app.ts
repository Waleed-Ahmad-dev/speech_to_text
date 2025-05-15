import 'dotenv/config';
import express from 'express';
import router from './routes/uploadRoute';

const app = express();

app.use(express.json());
app.use("/api", router)

app.get('/', (req, res) => {
     res.send('Speech-to-Text API is running');
});

const PORT = process.env.PORT || 3000;
const url = process.env.URL || 'localhost';

app.listen(PORT, () => console.log(`Server running on http://${url}:${PORT}`));