// Importar libreria para respuestas
const Respuesta = require("../utils/respuesta.js");
// Recuperar función de inicialización de modelos
const initModels = require("../models/init-models.js").initModels;
// Crear la instancia de sequelize con la conexión a la base de datos
const sequelize = require("../config/sequelize.js");

// Cargar las definiciones del modelo en sequelize
const models = initModels(sequelize);
// Recuperar el modelo equipo
const Equipo = models.equipo;

class EquipoController {
  async getAllEquipos(req, res) {
    try {
      const data = await Equipo.findAll(); // Recupera todos los equipos
      res.json(Respuesta.exito(data, "Datos de los equipos recuperados"));
    } catch (err) {
      // Handle errors during the model call
      res
        .status(500)
        .json(
          Respuesta.error(
            null,
            `Error al recuperar los datos de los equipos: ${req.originalUrl}`
          )
        );
    }
  }

  async createEquipo(req, res) {
    // Implementa la lógica para crear un nuevo plato
    const equipo = req.body;

    try {
      const nuevoEquipo = await Equipo.create(equipo);

      res
        .status(201)
        .json(Respuesta.exito(nuevoEquipo, "Equipo creado correctamente"));
    } catch (err) {
      logMensaje("Error :" + err);
      res
        .status(500)
        .json(
          Respuesta.error(null, `Error al crear un equipo nuevo: ${equipo}`)
        );
    }
  }

  async deleteEquipo(req, res) {
    const idequipo = req.params.idequipo;
    try {
      const numFilas = await Equipo.destroy({
        where: {
          idequipo: idequipo,
        },
      });
      if (numFilas == 0) {
        // No se ha encontrado lo que se quería borrar
        res
          .status(404)
          .json(Respuesta.error(null, "No encontrado: " + idequipo));
      } else {
        res.status(204).send();
      }
    } catch (err) {
      logMensaje("Error :" + err);
      res
        .status(500)
        .json(
          Respuesta.error(
            null,
            `Error al eliminar los datos: ${req.originalUrl}`
          )
        );
    }
  }

  async getEquipoById(req, res) {
    // El id plato viene en la ruta /api/platos/:idplato
    const idequipo = req.params.idequipo;
    try {
      const fila = await Equipo.findByPk(idequipo);
      if (fila) {
        // Si se ha recuprado un plato
        res.json(Respuesta.exito(fila, "Equipo recuperado"));
      } else {
        res.status(404).json(Respuesta.error(null, "Equipo no encontrado"));
      }
    } catch (err) {
      logMensaje("Error :" + err);
      res
        .status(500)
        .json(
          Respuesta.error(
            null,
            `Error al recuperar los datos: ${req.originalUrl}`
          )
        );
    }
  }

  async getEquipoByCiudadAndFederado(req, res) {
    const ciudad = req.params.ciudad; // Obtenemos el parámetro de la ciudad de la URL
    const esta_federado = req.params.esta_federado;

    try {
      const equipos = await Equipo.findAll({
        where: { ciudad: ciudad, esta_federado: esta_federado === "true" }, // Filtramos equipos por la ciudad
      });

      if (equipos.length === 0) {
        return res
          .status(404)
          .json({ mensaje: "No se encontraron equipos en esa ciudad" });
      }

      res.json({ datos: equipos });
    } catch (error) {
      console.error("Error al buscar equipos:", error);
      res.status(500).json({ mensaje: "Error al recuperar los datos" });
    }
  }

  async updateEquipo(req, res) {
    const equipo = req.body; // Recuperamos datos para actualizar
    const idequipo = req.params.idequipo; // dato de la ruta

    if (idequipo != equipo.idequipo) {
      return res
        .status(400)
        .json(Respuesta.error(null, "El id del equipo no coincide"));
    }

    try {
      const numFilas = await Equipo.update(
        { ...equipo },
        { where: { idequipo } }
      );

      if (numFilas == 0) {
        // No se ha encontrado lo que se quería actualizar o no hay nada que cambiar
        res
          .status(404)
          .json(
            Respuesta.error(null, "No encontrado o no modificado: " + idequipo)
          );
      } else {
        // Al dar status 204 no se devuelva nada
        // res.status(204).json(Respuesta.exito(null, "Plato actualizado"));
        res.status(204).send();
      }
    } catch (err) {
      logMensaje("Error :" + err);
      res
        .status(500)
        .json(
          Respuesta.error(
            null,
            `Error al actualizar los datos: ${req.originalUrl}`
          )
        );
    }
  }
}

module.exports = new EquipoController();

// Structure of result (MySQL)
// {
//   fieldCount: 0,
//   affectedRows: 1, // Number of rows affected by the query
//   insertId: 1,     // ID generated by the insertion operation
//   serverStatus: 2,
//   warningCount: 0,
//   message: '',
//   protocol41: true,
//   changedRows: 0   // Number of rows changed by the query
// }
