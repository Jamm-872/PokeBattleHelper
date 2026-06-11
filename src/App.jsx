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
  const [habilidades, setHabilidades] = useState([]);
  const [habilidadActiva, setHabilidadActiva] = useState(null);
  const [cadenaEvolutiva, setCadenaEvolutiva] = useState([]);

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

  useEffect(() => {
    const cargarHabilidades = async () => {
      if (!pokemonSeleccionado) return;
      setHabilidadActiva(null);

      const promesas = pokemonSeleccionado.abilities.map(async (a) => {
        const res = await fetch(a.ability.url);
        const data = await res.json();
        const entradaEs = data.flavor_text_entries.find(
          (e) => e.language.name === "es",
        );
        const entradaEn = data.flavor_text_entries.find(
          (e) => e.language.name === "en",
        );
        return {
          nombre: a.ability.name,
          esOculta: a.is_hidden,
          descripcion: entradaEs //  busca español
            ? entradaEs.flavor_text
            : entradaEn // si no hay, inglés
              ? entradaEn.flavor_text
              : "Sin descripción disponible.",
        };
      });

      const resultado = await Promise.all(promesas);
      setHabilidades(resultado);
    };

    cargarHabilidades();
  }, [pokemonSeleccionado]);

  useEffect(() => {
    const cargarEvoluciones = async () => {
      if (!pokemonSeleccionado) return;
      setCadenaEvolutiva([]);

      const speciesRes = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${pokemonSeleccionado.id}`,
      );
      const speciesData = await speciesRes.json();

      const cadenaRes = await fetch(speciesData.evolution_chain.url);
      const cadenaData = await cadenaRes.json();

      const fases = [];
      let actual = cadenaData.chain;

      while (actual) {
        fases.push({
          nombre: actual.species.name,
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${actual.species.url.split("/").slice(-2, -1)[0]}.png`,
        });
        actual = actual.evolves_to[0] ?? null;
      }

      setCadenaEvolutiva(fases);
    };

    cargarEvoluciones();
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
            <>
              {/* CAJA SCROLLEABLE */}
              <div className="info-scroll-box">
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

                <div className="section-header">
                  <span className="accent-line"></span>
                  <h2 className="right-panel-title">Debilidades</h2>
                </div>
                <div className="compact-row">
                  {renderEfectividad(tablaEfectividad.x4, "x4")}
                  {renderEfectividad(tablaEfectividad.x2, "x2")}
                </div>

                <div className="section-header">
                  <span className="accent-line"></span>
                  <h2 className="right-panel-title">Resistencias</h2>
                </div>
                <div className="compact-row">
                  {renderEfectividad(tablaEfectividad.x05, "1/2")}
                  {renderEfectividad(tablaEfectividad.x025, "1/4")}
                </div>

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

              {/* HABILIDADES - FIJO */}
              <div className="section-header section-habilidades">
                <span className="accent-line"></span>
                <h2 className="right-panel-title">Habilidades</h2>
              </div>
              <div className="compact-row">
                {habilidades.map((hab) => (
                  <div
                    key={hab.nombre}
                    className={`ability-badge ${hab.esOculta ? "hidden-ability" : ""} ${habilidadActiva === hab.nombre ? "active" : ""}`}
                    onClick={() =>
                      setHabilidadActiva(
                        habilidadActiva === hab.nombre ? null : hab.nombre,
                      )
                    }
                  >
                    {hab.esOculta && <span className="hidden-tag">OCULTA</span>}
                    <span className="ability-name">
                      {hab.nombre.replace(/-/g, " ")}
                    </span>
                  </div>
                ))}
              </div>

              {/* EVOLUCIONES - FIJO */}
              <div className="section-header section-evoluciones">
                <span className="accent-line"></span>
                <h2 className="right-panel-title">Evoluciones</h2>
              </div>
              <div className="evo-chain">
                {cadenaEvolutiva.map((fase, i) => (
                  <div key={fase.nombre} className="evo-chain-item">
                    <div className="evo-slot">
                      <img
                        src={fase.sprite}
                        alt={fase.nombre}
                        className="evo-sprite"
                      />
                      <span className="evo-name">{fase.nombre}</span>
                    </div>
                    {i < cadenaEvolutiva.length - 1 && (
                      <span className="evo-arrow">→</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* MODAL */}
          {habilidadActiva && (
            <div
              className="modal-overlay"
              onClick={() => setHabilidadActiva(null)}
            >
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <button
                  className="modal-close"
                  onClick={() => setHabilidadActiva(null)}
                >
                  ✕
                </button>
                <h3 className="modal-title">
                  {habilidades.find((h) => h.nombre === habilidadActiva)
                    ?.esOculta && (
                    <span className="hidden-tag" style={{ marginRight: "8px" }}>
                      OCULTA
                    </span>
                  )}
                  {habilidadActiva.replace(/-/g, " ")}
                </h3>
                <p className="modal-desc">
                  {
                    habilidades.find((h) => h.nombre === habilidadActiva)
                      ?.descripcion
                  }
                </p>
              </div>
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
