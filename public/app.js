// ===============================
// DATOS
// ===============================

let ventas =
  JSON.parse(
    localStorage.getItem("ventas")
  ) || [];


// ===============================
// VARIABLES DE GRÁFICAS
// ===============================

let graficaProductos;
let graficaCiudades;
let graficaCategorias;
let graficaUtilidades;
let graficaUnidades;
let graficaUtilidadCiudad;


// ===============================
// ELEMENTOS
// ===============================

const form =
  document.getElementById("formVenta");

const resultadoIA =
  document.getElementById("resultadoIA");


// ===============================
// REGISTRAR VENTA
// ===============================

form.addEventListener(
  "submit",
  function (e) {

    e.preventDefault();

    const producto =
      document.getElementById(
        "producto"
      ).value.trim();

    const categoria =
      document.getElementById(
        "categoria"
      ).value;

    const ciudad =
      document.getElementById(
        "ciudad"
      ).value;

    const cantidad =
      Number(
        document.getElementById(
          "cantidad"
        ).value
      );

    const precio =
      Number(
        document.getElementById(
          "precio"
        ).value
      );

    const costo =
      Number(
        document.getElementById(
          "costo"
        ).value
      );


    if (
      !producto ||
      !categoria ||
      !ciudad ||
      cantidad <= 0 ||
      precio < 0 ||
      costo < 0
    ) {

      alert(
        "Completa correctamente todos los campos."
      );

      return;
    }


    const totalVenta =
      cantidad * precio;


    const costoTotal =
      cantidad * costo;


    const utilidad =
      totalVenta - costoTotal;


    const venta = {

      producto,
      categoria,
      ciudad,
      cantidad,
      precio,
      costo,
      totalVenta,
      utilidad

    };


    ventas.push(venta);


    guardarDatos();


    form.reset();


    resultadoIA.innerHTML =
      "Los datos cambiaron. Genera nuevamente el análisis con IA.";

  }
);


// ===============================
// GUARDAR DATOS
// ===============================

function guardarDatos() {

  localStorage.setItem(
    "ventas",
    JSON.stringify(ventas)
  );

  actualizarDashboard();

}


// ===============================
// FORMATO MONEDA
// ===============================

function formatoDinero(valor) {

  return new Intl.NumberFormat(
    "es-CO",
    {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }
  ).format(valor);

}


// ===============================
// ACTUALIZAR DASHBOARD
// ===============================

function actualizarDashboard() {

  actualizarTabla();

  actualizarIndicadores();

  actualizarGraficas();

}


// ===============================
// TABLA
// ===============================

function actualizarTabla() {

  const tabla =
    document.getElementById(
      "tablaVentas"
    );


  tabla.innerHTML = "";


  ventas.forEach(
    (venta) => {

      const fila =
        document.createElement(
          "tr"
        );


      fila.innerHTML = `

        <td>
          ${venta.producto}
        </td>

        <td>
          ${venta.categoria}
        </td>

        <td>
          ${venta.ciudad}
        </td>

        <td>
          ${venta.cantidad}
        </td>

        <td>
          ${formatoDinero(
            venta.totalVenta
          )}
        </td>

        <td>
          ${formatoDinero(
            venta.utilidad
          )}
        </td>

      `;


      tabla.appendChild(fila);

    }
  );

}


// ===============================
// INDICADORES
// ===============================

function actualizarIndicadores() {

  const ventasTotales =
    ventas.reduce(
      (total, venta) =>
        total +
        Number(
          venta.totalVenta
        ),
      0
    );


  const utilidadTotal =
    ventas.reduce(
      (total, venta) =>
        total +
        Number(
          venta.utilidad
        ),
      0
    );


  const unidadesTotales =
    ventas.reduce(
      (total, venta) =>
        total +
        Number(
          venta.cantidad
        ),
      0
    );


  document.getElementById(
    "ventasTotales"
  ).textContent =
    formatoDinero(
      ventasTotales
    );


  document.getElementById(
    "utilidadTotal"
  ).textContent =
    formatoDinero(
      utilidadTotal
    );


  document.getElementById(
    "unidadesTotales"
  ).textContent =
    unidadesTotales;


  document.getElementById(
    "totalRegistros"
  ).textContent =
    ventas.length;

}


// ===============================
// GRÁFICAS
// ===============================

function actualizarGraficas() {

  const productos = {};

  const ciudades = {};

  const categorias = {};

  const utilidades = {};

  const unidades = {};

  const utilidadCiudad = {};


  ventas.forEach(
    (venta) => {


      productos[
        venta.producto
      ] =
        (
          productos[
            venta.producto
          ] || 0
        ) +
        Number(
          venta.totalVenta
        );


      ciudades[
        venta.ciudad
      ] =
        (
          ciudades[
            venta.ciudad
          ] || 0
        ) +
        Number(
          venta.totalVenta
        );


      categorias[
        venta.categoria
      ] =
        (
          categorias[
            venta.categoria
          ] || 0
        ) +
        Number(
          venta.totalVenta
        );


      utilidades[
        venta.producto
      ] =
        (
          utilidades[
            venta.producto
          ] || 0
        ) +
        Number(
          venta.utilidad
        );


      unidades[
        venta.producto
      ] =
        (
          unidades[
            venta.producto
          ] || 0
        ) +
        Number(
          venta.cantidad
        );


      utilidadCiudad[
        venta.ciudad
      ] =
        (
          utilidadCiudad[
            venta.ciudad
          ] || 0
        ) +
        Number(
          venta.utilidad
        );

    }
  );


  // Destruir gráficas anteriores

  if (graficaProductos) {
    graficaProductos.destroy();
  }

  if (graficaCiudades) {
    graficaCiudades.destroy();
  }

  if (graficaCategorias) {
    graficaCategorias.destroy();
  }

  if (graficaUtilidades) {
    graficaUtilidades.destroy();
  }

  if (graficaUnidades) {
    graficaUnidades.destroy();
  }

  if (graficaUtilidadCiudad) {
    graficaUtilidadCiudad.destroy();
  }


  // ===============================
  // VENTAS POR PRODUCTO
  // ===============================

  graficaProductos =
    new Chart(
      document.getElementById(
        "graficaProductos"
      ),
      {

        type: "bar",

        data: {

          labels:
            Object.keys(
              productos
            ),

          datasets: [
            {

              label:
                "Ventas ($)",

              data:
                Object.values(
                  productos
                )

            }
          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio:
            false,

          plugins: {

            legend: {
              display: false
            }

          }

        }

      }
    );


  // ===============================
  // VENTAS POR CIUDAD
  // ===============================

  graficaCiudades =
    new Chart(
      document.getElementById(
        "graficaCiudades"
      ),
      {

        type: "doughnut",

        data: {

          labels:
            Object.keys(
              ciudades
            ),

          datasets: [
            {

              data:
                Object.values(
                  ciudades
                )

            }
          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio:
            false

        }

      }
    );


  // ===============================
  // VENTAS POR CATEGORÍA
  // ===============================

  graficaCategorias =
    new Chart(
      document.getElementById(
        "graficaCategorias"
      ),
      {

        type: "pie",

        data: {

          labels:
            Object.keys(
              categorias
            ),

          datasets: [
            {

              data:
                Object.values(
                  categorias
                )

            }
          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio:
            false

        }

      }
    );


  // ===============================
  // UTILIDAD POR PRODUCTO
  // ===============================

  graficaUtilidades =
    new Chart(
      document.getElementById(
        "graficaUtilidades"
      ),
      {

        type: "bar",

        data: {

          labels:
            Object.keys(
              utilidades
            ),

          datasets: [
            {

              label:
                "Utilidad ($)",

              data:
                Object.values(
                  utilidades
                )

            }
          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio:
            false,

          plugins: {

            legend: {
              display: false
            }

          }

        }

      }
    );


  // ===============================
  // UNIDADES POR PRODUCTO
  // ===============================

  graficaUnidades =
    new Chart(
      document.getElementById(
        "graficaUnidades"
      ),
      {

        type: "bar",

        data: {

          labels:
            Object.keys(
              unidades
            ),

          datasets: [
            {

              label:
                "Unidades",

              data:
                Object.values(
                  unidades
                )

            }
          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio:
            false,

          plugins: {

            legend: {
              display: false
            }

          }

        }

      }
    );


  // ===============================
  // UTILIDAD POR CIUDAD
  // ===============================

  graficaUtilidadCiudad =
    new Chart(
      document.getElementById(
        "graficaUtilidadCiudad"
      ),
      {

        type: "bar",

        data: {

          labels:
            Object.keys(
              utilidadCiudad
            ),

          datasets: [
            {

              label:
                "Utilidad ($)",

              data:
                Object.values(
                  utilidadCiudad
                )

            }
          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio:
            false,

          plugins: {

            legend: {
              display: false
            }

          }

        }

      }
    );

}


// ===============================
// DATOS DE PRUEBA
// ===============================

document.getElementById(
  "btnEjemplo"
).addEventListener(
  "click",
  function () {

    ventas = [

      {

        producto:
          "Café Premium",

        categoria:
          "Bebidas",

        ciudad:
          "Bogotá",

        cantidad:
          25,

        precio:
          18000,

        costo:
          10000,

        totalVenta:
          450000,

        utilidad:
          200000

      },


      {

        producto:
          "Té Verde",

        categoria:
          "Bebidas",

        ciudad:
          "Medellín",

        cantidad:
          18,

        precio:
          15000,

        costo:
          8000,

        totalVenta:
          270000,

        utilidad:
          126000

      },


      {

        producto:
          "Galletas",

        categoria:
          "Alimentos",

        ciudad:
          "Bogotá",

        cantidad:
          40,

        precio:
          7000,

        costo:
          3500,

        totalVenta:
          280000,

        utilidad:
          140000

      },


      {

        producto:
          "Chocolate",

        categoria:
          "Alimentos",

        ciudad:
          "Cali",

        cantidad:
          12,

        precio:
          12000,

        costo:
          7000,

        totalVenta:
          144000,

        utilidad:
          60000

      }

    ];


    guardarDatos();


    resultadoIA.innerHTML =
      "Datos de prueba cargados correctamente. Ahora puedes generar el análisis con IA.";

  }
);


// ===============================
// ANÁLISIS CON IA
// ===============================

document.getElementById(
  "btnAnalizar"
).addEventListener(
  "click",
  async function () {


    if (
      ventas.length === 0
    ) {

      alert(
        "Primero debes registrar ventas."
      );

      return;

    }


    const boton =
      document.getElementById(
        "btnAnalizar"
      );


    boton.disabled = true;

    boton.textContent =
      "Analizando...";


    resultadoIA.innerHTML =
      "<p>🤖 Analizando información empresarial...</p>";


    try {


      const respuesta =
        await fetch(
          "/api/analisis",
          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify(
                {
                  ventas
                }
              )

          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok
      ) {

        throw new Error(
          datos.error ||
          "No fue posible generar el análisis."
        );

      }


      // ============================
      // CONVERTIR MARKDOWN A HTML
      // ============================

      const markdown =
        datos.analisis ||
        "No fue posible generar el análisis.";


      resultadoIA.innerHTML =
        marked.parse(
          markdown
        );


      if (
        datos.modelo
      ) {

        const modeloInfo =
          document.createElement(
            "small"
          );


        modeloInfo.style.display =
          "block";

        modeloInfo.style.marginTop =
          "20px";

        modeloInfo.style.color =
          "#6b7280";


        modeloInfo.textContent =
          `Análisis generado con inteligencia artificial.`;


        resultadoIA.appendChild(
          modeloInfo
        );

      }


    } catch (error) {


      console.error(
        error
      );


      resultadoIA.innerHTML = `

        <p>
          <strong>
            No fue posible generar el análisis.
          </strong>
        </p>

        <p>
          ${error.message}
        </p>

      `;

    } finally {


      boton.disabled = false;


      boton.textContent =
        "Generar análisis con IA";

    }

  }
);


// ===============================
// INICIAR DASHBOARD
// ===============================

actualizarDashboard();