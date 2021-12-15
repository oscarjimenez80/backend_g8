import Usuario from "../models/Usuario";
import bcrypt from "bcrypt";
import { generarJwt } from "../helpers/jwt";
import Proyecto from "../models/Proyecto";
import Avance from "../models/Avance";
import Inscripcion from "../models/Inscripcion";

export const resolvers = {
  Query: {
    async login(_, { email, password }) {
      const usuario = await Usuario.findOne({
        email,
      });

      if (!usuario) {
        return "Usuario o contraseña incorrecta";
      }

      const validarPassword = bcrypt.compareSync(password, usuario.password);

      if (validarPassword) {
        const token = await generarJwt(usuario.id, usuario.nombre, usuario.rol);
        return token;
      } else {
        return "Usuario o contraseña incorrecta";
      }
    },


    async proyectos(_, args, context) {

      if (context.user.auth && (context.user.rol === "Administrador")
      ) {
        return await Proyecto.find().populate("lider");

      } else if (context.user.auth && (context.user.rol === "Lider")) {
        return await Proyecto.find({lider: context.user.id}).populate("lider");

      } else if (context.user.auth && (context.user.rol === "Estudiante")) {
        return await Proyecto.find({estado: true}).populate("lider");

      } else {
        return null;
      }
    },
    
    async Usuarios(_, args, context) {
      if (context.user.auth && context.user.rol === "Administrador") {
        return await Usuario.find();
      } else if (context.user.auth && context.user.rol === "Lider") {
        return await Usuario.find({ rol: "Estudiante" });
      } else {
        return null;
      }
    },

    async Inscripciones(_,args,context) {
      if (context.user.auth && context.user.rol === "Lider") {
        return await Inscripcion.find().populate("usuario_id").populate("proyecto_id");
      } else {
        return null;
      }
    },


    async informacionProyectoLider(_, { id }, context) {
      console.log(context);
      if (context.user.auth) {
        if (context.user.rol === "Lider") {
          return await Proyecto.findById(id).populate("avances");
        } else {
          return null;
        }
      } else {
        return null;
      }
    },

    async listaAvances(_, { idProyecto }, context) {
      if (context.user.auth) {
        if (context.user.rol === "Estudiante") {
          return await Avance.find({ proyecto_id: idProyecto });
        } else {
          return null;
        }
      } else {
        return null;
      }
    },
  },

  Mutation: {
    async agregarUsuario(_, { input }) {
      const salt = bcrypt.genSaltSync();

      let usuario = new Usuario(input);
      usuario.password = bcrypt.hashSync(usuario.password, salt);

      return await usuario.save();
    },

    async agregarProyecto(_, { input },context) {
      if (context.user.auth && context.user.rol === "Lider") {
        const proyecto = new Proyecto(input);

        return await proyecto.save();
      } else {
        return null;
      }
    },

    async actualizarEstadoProyecto(parent, args, context) {
      if (context.user.auth && context.user.rol === "Administrador") {
        return await Proyecto.findByIdAndUpdate(
          args.id,
          {
            estado: args.estado,
            fase: args.fase,
          },
          { new: true }
        );
      } else {
        return null;
      }
    },

    async actualizarInfoProyecto(parent, args, context) {
      if (context.user.auth && context.user.rol === "Lider") {
        return await Proyecto.findByIdAndUpdate(
          args.id,
          {
            nombre: args.nombre,
            objetivosG: args.objetivosG,
            objetivosE: args.objetivosE,
            presupuesto: args.presupuesto,
          },
          { new: true }
        );
      } else {
        return null;
      }
    },

    async actualizarUsuario(parent, args, context) {
      if (context.user.auth) {
        const salt = bcrypt.genSaltSync();
        return await Usuario.findByIdAndUpdate(
          args.id,
          {
            nombre: args.nombre,
            email: args.email,
            dni: args.dni,
            rol: args.rol,
            password: (args.password = bcrypt.hashSync(args.password, salt)),
          },
          { new: true }
        );
      } else {
        return null;
      }
    },

    async agregarInscripcion(parent, { input }, context) {
      if (context.user.auth && context.user.rol === "Estudiante") {
        const inscripcion = new Inscripcion(input);
        return await inscripcion.save();
      } else {
        return null;
      }
    },

    async actualizarEstadoInscripcion(parent, args,context) {
      if (context.user.auth && context.user.rol === "Lider") {
        const inscripcion = await Inscripcion.findById(args.id);

        return await Inscripcion.findByIdAndUpdate(
          args.id,
          {
            estado: args.estado,
          },
          { new: true }
        );
      } else {
        return null;
      }
    },

    async actualizarEstadoUser(parent, args, context) {
      if (context.user.auth && context.user.rol === "Administrador") {
        return await Usuario.findByIdAndUpdate(
          args.id,
          { estado: args.estado },
          { new: true }
        );
      } else {
        return null;
      }
    },
    async actualizarEstadoEstudiante(parent, args, context) {
      if (context.user.auth && context.user.rol === "Lider") {
        const estudiante = await Usuario.findById(args.id);
        if (estudiante.rol === "Estudiante") {
          return await Usuario.findByIdAndUpdate(
            args.id,
            { estado: args.estado },
            { new: true }
          );
        } else {
          return null;
        }
      }
    },
    //HU-18
    async agregarObservacion(_, { idAvance, observacion }, context) {
      if (context.user.auth) {
        if (context.user.rol === "Lider") {
          let { observaciones } = await Avance.findById(idAvance);
           let inObservacion={
             observacion:observacion,
             fechaObservacion: Date.now()
           }
          let nObservacion = [...observaciones, inObservacion];
          return await Avance.findByIdAndUpdate(
            idAvance,
            { observaciones: nObservacion },
            { new: true }
          );
        }
      }
    },
    //HU-22
    async agregarAvance(_, { idProyecto, avance }, context) {
      if (context.user.auth) {
        if (context.user.rol === "Estudiante") {
          let inAvance = {
            proyecto_id: idProyecto,
            usuario_id: context.user.id,
            fechaAvance: Date.now(),
            avanceEstudiante: avance,
          };
          let nuevoAvance = new Avance(inAvance);
          let { _id } = await nuevoAvance.save();
          console.log(_id);
          if (_id) {
            let { avances } = await Proyecto.findById(idProyecto);
            let nAvances = [...avances, _id];
            return await Proyecto.findByIdAndUpdate(
              idProyecto,
              { avances: nAvances },
              { new: true }
              ).populate("avances");
            }
          } else {
            return "No está autorizado para agregar avances";
          }
        } else {
          return "No está autorizado para agregar avances";
        }
      },
      //HU-23
      async actualizarAvance(_, { idAvance, avance }, context) {
        if (context.user.auth) {
          if (context.user.rol === "Estudiante") {
            let inAvance = {
              usuario_id: context.user.id,
              fechaAvance: Date.now(),
              avanceEstudiante: avance,
            };
            return await Avance.findByIdAndUpdate(idAvance, inAvance, { new: true });
            
          } else {
            return "No está autorizado para agregar avances";
          }
        } else {
          return "No está autorizado para agregar avances";
        }
      },
    },
};
