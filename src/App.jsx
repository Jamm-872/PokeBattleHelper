import { useState, useEffect } from "react";
import Navbar from "./components/navbar";
import "./App.css";
import shiny_particle from "./assets/shiny_particle.png";

function App() {
  const [listaMaestra, setListaMaestra] = useState([]);
  const [pokemonSeleccionado, setPokemonSeleccionado] = useState(null);
  const [esShiny, setEsShiny] = useState(false);
  const [debilidades, setDebilidades] = useState({ x2: [], x4: [] });
  const [tablaEfectividad, setTablaEfectividad] = useState({
    x4: [],
    x2: [],
    x05: [],
    x025: [],
    x0: [],
  });

  const renderEfectividad = (lista, multiplicadorTexto) => {
    return lista.map((tipo) => {
      // Detectamos si es un multiplicador crítico (x4 o 1/4)
      const esCritico =
        multiplicadorTexto === "x4" || multiplicadorTexto === "1/4";

      if (!esCritico) {
        return (
          <div key={tipo} className={`type-badge ${tipo}`}>
            <div className="type-icon-circle">
              <img src={ICONOS_TIPOS[tipo]} alt={tipo} className="type-icon" />
            </div>
            <span className="type-text">{tipo}</span>
          </div>
        );
      }

      // DISEÑO SEGÚN TU REFERENCIA: Píldora centrada + óvalo oscuro al lado
      return (
        <div key={tipo} className="badge-with-tag">
          <div className={`type-badge-main ${tipo}`}>
            <div className="type-icon-circle">
              <img src={ICONOS_TIPOS[tipo]} alt={tipo} className="type-icon" />
            </div>
            <span className="type-text">{tipo}</span>
          </div>
          <div className="mult-tag-extension">x4</div>
        </div>
      );
    });
  };

  const handleSearch = async (nombrePokemon) => {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${nombrePokemon}`,
      );
      const data = await response.json();
      setPokemonSeleccionado(data);
      setEsShiny(false);
      console.log("Datos del Pokémon:", data);
    } catch (error) {
      alert("Pokémon no encontrado");
    }
  };

  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=-1")
      .then((res) => res.json())
      .then((data) => {
        setListaMaestra(data.results);
      });
  }, []);

  useEffect(() => {
    const calcularEfectividades = async () => {
      if (!pokemonSeleccionado) return;

      try {
        setTablaEfectividad({ x4: [], x2: [], x05: [], x025: [], x0: [] });

        const promesas = pokemonSeleccionado.types.map((t) =>
          fetch(t.type.url).then((res) => res.json()),
        );
        const datosTipos = await Promise.all(promesas);

        // 1. Obtenemos una lista de TODOS los tipos existentes para evaluarlos
        const resTipos = await fetch("https://pokeapi.co/api/v2/type");
        const { results: todosLosTipos } = await resTipos.json();

        const multiplicadoresFinales = {};

        todosLosTipos.forEach((tipoAtaque) => {
          if (tipoAtaque.name === "shadow" || tipoAtaque.name === "unknown")
            return;

          let mult = 1;

          datosTipos.forEach((tipoDefensor) => {
            const relaciones = tipoDefensor.damage_relations;

            if (
              relaciones.double_damage_from.some(
                (t) => t.name === tipoAtaque.name,
              )
            )
              mult *= 2;
            if (
              relaciones.half_damage_from.some(
                (t) => t.name === tipoAtaque.name,
              )
            )
              mult *= 0.5;
            if (
              relaciones.no_damage_from.some((t) => t.name === tipoAtaque.name)
            )
              mult *= 0;
          });

          if (mult !== 1) {
            multiplicadoresFinales[tipoAtaque.name] = mult;
          }
        });

        // 3. Clasificamos
        const nuevaTabla = { x4: [], x2: [], x05: [], x025: [], x0: [] };

        Object.keys(multiplicadoresFinales).forEach((tipo) => {
          const m = multiplicadoresFinales[tipo];
          if (m === 4) nuevaTabla.x4.push(tipo);
          else if (m === 2) nuevaTabla.x2.push(tipo);
          else if (m === 0.5) nuevaTabla.x05.push(tipo);
          else if (m === 0.25) nuevaTabla.x025.push(tipo);
          else if (m === 0) nuevaTabla.x0.push(tipo);
        });

        setTablaEfectividad(nuevaTabla);
      } catch (error) {
        console.error("Error en cálculos:", error);
      }
    };

    calcularEfectividades();
  }, [pokemonSeleccionado]);

  return (
    <div className="app-container">
      <Navbar onSearch={handleSearch} listaMaestra={listaMaestra} />
      <main className="main-layout">
        <section className="left-panel">
          {pokemonSeleccionado ? (
            <div className="poke-card">
              <div className="poke-header">
                <h2 style={{ textTransform: "capitalize" }}>
                  #{pokemonSeleccionado.id.toString().padStart(3, "0")} -{" "}
                  {pokemonSeleccionado.name}
                </h2>
                <button
                  className={`btn-shiny ${esShiny ? "active" : ""}`}
                  onClick={() => setEsShiny(!esShiny)}
                >
                  {!esShiny && (
                    <img
                      src={shiny_particle}
                      alt="shiny particles"
                      className="shiny-icon-btn"
                    />
                  )}
                  {esShiny ? "Normal" : "Shiny"}
                </button>
              </div>
              {/* --- IMAGEN DEL POKEMON--- */}
              <div className="pokedex-screen-frame">
                {/* Los dos puntos rojos de arriba */}
                <div className="screen-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>

                {/* El fondo gris donde vive el sprite */}
                <div className="screen-display">
                  <img
                    src={
                      esShiny
                        ? pokemonSeleccionado.sprites.other["official-artwork"]
                            .front_shiny
                        : pokemonSeleccionado.sprites.other["official-artwork"]
                            .front_default
                    }
                    alt={pokemonSeleccionado.name}
                    className="poke-img"
                  />
                </div>

                {/* La esquina doblada y las rejillas de abajo */}
                <div className="screen-footer">
                  <div className="big-dot"></div>
                  <div className="speaker-grill">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
              {/* --- ESTADISTICAS DEL POKEMON--- */}
              <div className="poke-stats-container">
                {pokemonSeleccionado.stats.map((item) => (
                  <div key={item.stat.name} className="stat-row">
                    <span className="stat-label">
                      {item.stat.name.replace("special-", "sp. ")}
                    </span>

                    <div className="stat-bar-wrapper">
                      <div
                        className="stat-bar-fill"
                        style={{ width: `${(item.base_stat / 255) * 100}%` }}
                      ></div>
                    </div>

                    <span className="stat-value">{item.base_stat}</span>
                  </div>
                ))}
              </div>
              {/* ------------------------------------------ */}
            </div>
          ) : (
            <p>Esperando selección...</p>
          )}
        </section>

        <section className="right-panel">
          {pokemonSeleccionado && (
            <div className="info-container-compact">
              {/* SECCIÓN TIPOS */}
              <div className="section-header">
                <span className="accent-line"></span>
                <h2 className="right-panel-title">Tipos</h2>
              </div>
              <div className="compact-row">
                {pokemonSeleccionado.types.map((t) => (
                  <div
                    key={t.type.name}
                    className={`type-badge ${t.type.name}`}
                  >
                    <div className="type-icon-circle">
                      <img
                        src={ICONOS_TIPOS[t.type.name]}
                        alt={t.type.name}
                        className="type-icon"
                      />
                    </div>
                    <span className="type-text">{t.type.name}</span>
                  </div>
                ))}
              </div>

              {/* SECCIÓN DEBILIDADES */}
              <div className="section-header">
                <span className="accent-line"></span>
                <h2 className="right-panel-title">Debilidades</h2>
              </div>
              <div className="compact-row">
                {renderEfectividad(tablaEfectividad.x4, "x4")}
                {renderEfectividad(tablaEfectividad.x2, "x2")}
              </div>

              {/* SECCIÓN RESISTENCIAS */}
              <div className="section-header">
                <span className="accent-line"></span>
                <h2 className="right-panel-title">Resistencias</h2>
              </div>
              <div className="compact-row">
                {renderEfectividad(tablaEfectividad.x05, "1/2")}
                {renderEfectividad(tablaEfectividad.x025, "1/4")}
              </div>

              {/* SECCIÓN INMUNIDADES (Solo se muestra si existen) */}
              {tablaEfectividad.x0.length > 0 && (
                <>
                  <div className="section-header">
                    <span className="accent-line"></span>
                    <h2 className="right-panel-title">Inmunidades</h2>
                  </div>
                  <div className="compact-row">
                    {renderEfectividad(tablaEfectividad.x0, "0")}
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const ICONOS_TIPOS = {
  fire: "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/fire.svg",
  water:
    "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/water.svg",
  grass:
    "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/grass.svg",
  electric:
    "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/electric.svg",
  ice: "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/ice.svg",
  fighting:
    "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/fighting.svg",
  poison:
    "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/poison.svg",
  ground:
    "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/ground.svg",
  flying:
    "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/flying.svg",
  psychic:
    "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/psychic.svg",
  bug: "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/bug.svg",
  rock: "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/rock.svg",
  ghost:
    "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/ghost.svg",
  dragon:
    "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/dragon.svg",
  dark: "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/dark.svg",
  steel:
    "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/steel.svg",
  fairy:
    "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/fairy.svg",
  normal:
    "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/normal.svg",
};

export default App;
