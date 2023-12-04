import express from 'express';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Use body-parser middleware
app.use(bodyParser.json());

// Use routes from the routes folder
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
