import { makeExecutableSchema } from "@graphql-tools/schema";
import { resolvers } from "./resolvers";

const typeDefs = `

    type Query {
        login(email: String!, password: String!): Auth,
        proyectos: [Proyecto],
        Inscripciones: [Inscripcion],
        Usuarios : [Usuario],
        UsuarioById(id: ID!) : Usuario,
        informacionProyectoLider(id: ID!): Proyecto,
        listaAvances(idProyecto:ID!):[Avance]
        
    }
    type Auth {
        token: String,
        usuario: String,
        rol: String
    }

    type Mutation {
        agregarUsuario(input: UsuarioInput): Usuario,

        agregarProyecto(input: ProyectoInput): Proyecto,
        agregarInscripcion(input: InscripcionInput): Inscripcion,
        actualizarUsuario(id : ID!, 
            nombre: String,
            email: String,
            dni: String,
            rol: String,
            password: String ): Usuario,
        actualizarEstadoProyecto(id: ID!,
            estado: Boolean,
            fase: String): Proyecto,
        actualizarInfoProyecto(id: ID!,
            nombre: String,
            objetivosG: [String],
            objetivosE: [String],
            presupuesto: Int): Proyecto,
       
        actualizarEstadoInscripcion(id:ID!,estado:String!): Inscripcion,
        actualizarEstadoUser(id:ID!,estado:String!):Usuario,
        actualizarEstadoEstudiante(id:ID!,estado:String!):Usuario,
        agregarObservacion(idAvance: ID! , observacion: String!) : Avance,
        agregarAvance(idProyecto:ID!, avance:String!): Proyecto,
        actualizarAvance(idAvance:ID!,avance:String!): Avance     

    }

    type Usuario {
        id: ID!,
        nombre: String,
        email: String,
        dni: String,
        password: String,
        rol: String,
        estado: String
    }
    type Observacion{
        observacion:String,
        fechaObservacion: String
     }
     
    type Avance {
         id: ID,
         proyecto_id: ID,
         usuario_id: ID,
         fechaAvance: String,
         avanceEstudiante: String,
         observaciones: [Observacion]   
    }

   
    type Proyecto {
        id: ID,
        nombre: String,
        objetivosG: String,
        objetivosE: String,
        presupuesto: Int,
        fechaInicio: String,
        fechaFin: String,
        lider: Usuario,
        estado: Boolean,
        fase: String      
        avances: [Avance]


    }

    type AvanceEstudiante{
        avanceEstudiante: ID!
    }
  
    input UsuarioInput {
        nombre: String,
        email: String,
        dni: String,
        password: String,
        rol: String,
        estado: String
    }

    input ProyectoInput {
        nombre: String,
        objetivosG: String,
        objetivosE: String,
        presupuesto: Int,
        lider: ID
    }

    input ObservacionInput{
        observacion: String!,
        fechaObservacion: String

    }
   
    type Inscripcion {
        id: ID,
        proyecto_id: Proyecto,
        usuario_id: Usuario,
        estado: String,
        fechaIngreso: String,
        fechaEgreso: String 
    }

    input InscripcionInput {
        proyecto_id: ID,
        usuario_id: ID
    }

`;


export default makeExecutableSchema({
  typeDefs: typeDefs,
  resolvers: resolvers,
});
