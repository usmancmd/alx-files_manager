import express from 'express';
import routes from './routes';

const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Use body-parser middleware
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use(bodyParser.json());

// Use routes from the routes folder
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
