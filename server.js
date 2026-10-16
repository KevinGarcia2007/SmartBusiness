const express = require("express");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// MODELOS DE RESPALDO
// ===============================

const MODELOS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.8-flash"
];

// ===============================
// FUNCIÓN PARA PROBAR MODELOS
// ===============================

async function generarConGemini(prompt) {
  let ultimoError = null;

  for (const modelo of MODELOS) {
    try {
      console.log(`Intentando con: ${modelo}`);

      const response = await ai.models.generateContent({
        model: modelo,
        contents: prompt
      });

      const texto = response.text;

      if (texto && texto.trim() !== "") {
        console.log(`✅ Respuesta generada con: ${modelo}`);

        return {
          texto,
          modelo
        };
      }
    } catch (error) {
      ultimoError = error;

      const status =
        error.status ||
        error.statusCode ||
        error?.error?.code;

      console.log(
        `❌ Falló ${modelo}. Código: ${status || "desconocido"}`
      );

      continue;
    }
  }

  throw ultimoError || new Error(
    "Ningún modelo de Gemini pudo responder."
  );
}

// ===============================
// RUTA PARA ANÁLISIS CON IA
// ===============================

app.post("/api/analisis", async (req, res) => {
  try {
    const { ventas } = req.body;

    if (
      !ventas ||
      !Array.isArray(ventas) ||
      ventas.length === 0
    ) {
      return res.status(400).json({
        error: "No hay ventas para analizar."
      });
    }

    // ===============================
    // CÁLCULOS GENERALES
    // ===============================

    const ventasTotales = ventas.reduce(
      (total, venta) =>
        total + Number(venta.totalVenta || 0),
      0
    );

    const utilidadTotal = ventas.reduce(
      (total, venta) =>
        total + Number(venta.utilidad || 0),
      0
    );

    const unidadesTotales = ventas.reduce(
      (total, venta) =>
        total + Number(venta.cantidad || 0),
      0
    );

    // ===============================
    // AGRUPAR DATOS
    // ===============================

    const productos = {};
    const ciudades = {};
    const categorias = {};
    const utilidadProductos = {};
    const utilidadCiudades = {};
    const unidadesProductos = {};

    ventas.forEach((venta) => {
      const producto =
        venta.producto || "Sin producto";

      const ciudad =
        venta.ciudad || "Sin ciudad";

      const categoria =
        venta.categoria || "Sin categoría";

      const totalVenta =
        Number(venta.totalVenta || 0);

      const utilidad =
        Number(venta.utilidad || 0);

      const cantidad =
        Number(venta.cantidad || 0);

      productos[producto] =
        (productos[producto] || 0) + totalVenta;

      ciudades[ciudad] =
        (ciudades[ciudad] || 0) + totalVenta;

      categorias[categoria] =
        (categorias[categoria] || 0) + totalVenta;

      utilidadProductos[producto] =
        (utilidadProductos[producto] || 0) + utilidad;

      utilidadCiudades[ciudad] =
        (utilidadCiudades[ciudad] || 0) + utilidad;

      unidadesProductos[producto] =
        (unidadesProductos[producto] || 0) + cantidad;
    });

    // ===============================
    // MARGEN GENERAL
    // ===============================

    const margenGeneral =
      ventasTotales > 0
        ? (
            (utilidadTotal / ventasTotales) * 100
          ).toFixed(2)
        : 0;

    // ===============================
    // PROMPT
    // ===============================

    const prompt = `
Actúa como un analista empresarial.

Analiza únicamente los datos suministrados por esta empresa.

No inventes información.
No agregues datos externos.
No supongas información que no esté presente.
Responde en español.
Usa un lenguaje sencillo, claro y profesional.

El objetivo es ayudar a una empresa a tomar mejores decisiones
a partir de sus ventas, utilidades y comportamiento comercial.

DATOS GENERALES

Ventas totales:
${ventasTotales} COP

Utilidad total:
${utilidadTotal} COP

Margen general aproximado:
${margenGeneral} %

Unidades vendidas:
${unidadesTotales}

Cantidad de registros:
${ventas.length}

VENTAS POR PRODUCTO

${JSON.stringify(productos, null, 2)}

VENTAS POR CIUDAD

${JSON.stringify(ciudades, null, 2)}

VENTAS POR CATEGORÍA

${JSON.stringify(categorias, null, 2)}

UTILIDAD POR PRODUCTO

${JSON.stringify(utilidadProductos, null, 2)}

UTILIDAD POR CIUDAD

${JSON.stringify(utilidadCiudades, null, 2)}

UNIDADES VENDIDAS POR PRODUCTO

${JSON.stringify(unidadesProductos, null, 2)}

Genera el análisis exactamente con esta estructura:

## RESUMEN GENERAL

Escribe un párrafo corto sobre el comportamiento general
de las ventas y la utilidad.

## MEJOR DESEMPEÑO

Identifica los productos, ciudades o categorías con
mejor desempeño.

Usa listas cuando sea conveniente e incluye cifras.

## ALERTA

Identifica algún producto, ciudad, categoría o resultado
que tenga un desempeño menor y que debería revisarse.

## RECOMENDACIONES

Genera exactamente 3 recomendaciones concretas y
realistas basadas únicamente en los datos suministrados.

## CONCLUSIÓN

Escribe una conclusión corta que explique cómo este
análisis puede apoyar la toma de decisiones empresariales.

Puedes usar Markdown para:
- títulos
- negritas
- listas
- numeración
`;

    // ===============================
    // CONSULTAR IA
    // ===============================

    const resultado = await generarConGemini(prompt);

    // ===============================
    // RESPUESTA AL FRONTEND
    // ===============================

    res.json({
      analisis: resultado.texto,
      modelo: resultado.modelo
    });

  } catch (error) {
    console.error(
      "ERROR FINAL GEMINI:",
      error
    );

    res.status(503).json({
      error:
        "En este momento los modelos de inteligencia artificial están temporalmente ocupados. Intenta nuevamente.",
      detalle:
        error?.message || "Error desconocido."
    });
  }
});

// ===============================
// RUTA DE PRUEBA
// ===============================

app.get("/api/prueba", (req, res) => {
  res.json({
    mensaje:
      "SmartBusiness está funcionando correctamente."
  });
});

// ===============================
// INICIAR SERVIDOR
// ===============================

app.listen(PORT, () => {
  console.log(
    `Servidor ejecutándose en http://localhost:${PORT}`
  );

  console.log("Modelos de respaldo:");

  MODELOS.forEach((modelo, index) => {
    console.log(`${index + 1}. ${modelo}`);
  });
});