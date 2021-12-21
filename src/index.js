import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import {dbConnection} from './database/config';
import schema from './graphql/schema';
import { validarJwt } from './middleware/validar-jwt';
import dotenv from "dotenv";
import cors from 'cors';

const app = express();
dotenv.config();

dbConnection();

app.use(cors());
app.use(validarJwt);

app.listen(process.env.PORT || 4000, () => {
    console.log(`Servidor ejecutandose en puerto ${process.env.PORT || 4000}`);
});

//Llamado Al MiddelWare
app.use("/graphql", graphqlHTTP((req)=>({
    graphiql: true,
    schema: schema,
    context: {
        user: req.user
    }
})));
