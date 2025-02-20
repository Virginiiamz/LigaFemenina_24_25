// Importar libreria para respuestas
const Respuesta = require("../utils/respuesta.js");
// Recuperar función de inicialización de modelos
const initModels = require("../models/init-models.js").initModels;
// Crear la instancia de sequelize con la conexión a la base de datos
const sequelize = require("../config/sequelize.js");

// Cargar las definiciones del modelo en sequelize
const models = initModels(sequelize);
// Recuperar el modelo equipo
const Jugadora = models.jugadora;
const Equipo = models.equipo;

class JugadoraController {
  async getGraficaJugadoras(req, res) {
    try {
      const data = await Jugadora.findAll({
        attributes: [
          [sequelize.col("idequipo_equipo.nombre"), "nombre"],
          [
            sequelize.fn("COUNT", sequelize.col("idequipo_equipo.nombre")),
            "cantidad",
          ],
        ],
        include: [
          {
            model: Equipo,
            as: "idequipo_equipo", // Alias usado en la relación
            attributes: [], // Evita traer columnas adicionales de Equipo
          },
        ],
        group: ["idequipo_equipo.nombre"],
        raw: true,
      });

      res.json(Respuesta.exito(data, "Datos de jugadoras recuperados"));
    } catch (err) {
      logMensaje("Error al recuperar los datos de las jugadoras: " + err);
      res
        .status(500)
        .json(
          Respuesta.error(
            null,
            `Error al recuperar los datos de las jugadoras: ${req.originalUrl}`
          )
        );
    }
  }

  async getAllJugadoras(req, res) {
    try {
      const data = await Jugadora.findAll({
        include: [
          {
            model: Equipo,
            as: "idequipo_equipo", // Usa el alias definido en las relaciones del modelo
            attributes: ["idequipo", "nombre"], // Selecciona los campos que quieres recuperar del equipo
          },
        ],
      }); // Recupera todos los equipos
      res.json(Respuesta.exito(data, "Datos de las jugadoras recuperados"));
    } catch (err) {
      // Handle errors during the model call
      res
        .status(500)
        .json(
          Respuesta.error(
            null,
            `Error al recuperar los datos de las jugadoras: ${req.originalUrl}`
          )
        );
    }
  }

  async createJugadora(req, res) {
    // Implementa la lógica para crear un nuevo plato
    const {
      nombre,
      apellidos,
      posicion,
      sueldo,
      disponible_jugar,
      fechainscripcion,
      idequipo,
    } = req.body;

    try {
      const nuevaJugadora = await Jugadora.create({
        nombre,
        apellidos,
        posicion,
        sueldo,
        disponible_jugar,
        fechainscripcion,
        idequipo,
      });

      res
        .status(201)
        .json(Respuesta.exito(nuevaJugadora, "Jugadora creada correctamente"));
    } catch (err) {
      logMensaje("Error :" + err);
      res
        .status(500)
        .json(Respuesta.error(null, `Error al crear una jugadora nueva`));
    }
  }

  async deleteJugadora(req, res) {
    const idjugadora = req.params.idjugadora;
    try {
      const numFilas = await Jugadora.destroy({
        where: {
          idjugadora: idjugadora,
        },
      });
      if (numFilas == 0) {
        // No se ha encontrado lo que se quería borrar
        res
          .status(404)
          .json(Respuesta.error(null, "No encontrado: " + idjugadora));
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

  async getJugadoraById(req, res) {
    const idjugadora = req.params.idjugadora;
    try {
      const fila = await Jugadora.findByPk(idjugadora, {
        include: [
          {
            model: Equipo,
            as: "idequipo_equipo", // Usa el alias definido en las relaciones del modelo
            attributes: ["idequipo", "nombre"], // Selecciona los campos que quieres recuperar del equipo
          },
        ],
      });
      if (fila) {
        res.json(Respuesta.exito(fila, "Jugadora recuperada"));
      } else {
        res.status(404).json(Respuesta.error(null, "Jugadora no encontrada"));
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

  async getJugadoraByEquipoAndDisponibleJugar(req, res) {
    const idequipo = req.params.idequipo; // Obtenemos el parámetro de la ciudad de la URL
    const disponible_jugar = req.params.disponible_jugar;

    try {
      const jugadoras = await Jugadora.findAll({
        where: {
          idequipo: idequipo,
          disponible_jugar: disponible_jugar === "true",
        },
        include: [
          {
            model: Equipo,
            as: "idequipo_equipo", // Usa el alias definido en las relaciones del modelo
            attributes: ["idequipo", "nombre"], // Selecciona los campos que quieres recuperar del equipo
          },
        ],
      });

      if (jugadoras.length === 0) {
        return res
          .status(404)
          .json({ mensaje: "No se encontraron jugadoras en ese equipo" });
      }

      res.json({ datos: jugadoras });
    } catch (error) {
      console.error("Error al buscar jugadoras:", error);
      res.status(500).json({ mensaje: "Error al recuperar los datos" });
    }
  }

  async updateJugadora(req, res) {
    const jugadora = req.body; // Recuperamos datos para actualizar
    const idjugadora = req.params.idjugadora; // dato de la ruta

    if (idjugadora != jugadora.idjugadora) {
      return res
        .status(400)
        .json(Respuesta.error(null, "El id de la jugadora no coincide"));
    }

    try {
      const numFilas = await Jugadora.update(
        { ...jugadora },
        { where: { idjugadora } }
      );

      if (numFilas == 0) {
        // No se ha encontrado lo que se quería actualizar o no hay nada que cambiar
        res
          .status(404)
          .json(
            Respuesta.error(
              null,
              "No encontrado o no modificado: " + idjugadora
            )
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

module.exports = new JugadoraController();
