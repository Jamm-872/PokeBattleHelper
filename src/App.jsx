import { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import "./App.css";
import usePokemonList from "./hooks/usePokemonList";
import useEfectividades from "./hooks/useEfectividades";
import useHabilidades from "./hooks/useHabilidades";
import useEvoluciones from "./hooks/useEvoluciones";
import AbilityModal from "./components/AbilityModal/AbilityModal";
import PokemonCard from "./components/PokemonCard/PokemonCard";
import PokemonInfo from "./components/PokemonInfo/PokemonInfo";

const CACHE_DIAS = 7;

const obtenerPokemon = async (nombre) => {
  const cacheKey = `pokemon_${nombre}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const diasTranscurridos = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
    if (diasTranscurridos < CACHE_DIAS) return data;
  }

  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);
  if (!response.ok) throw new Error("Pokémon no encontrado");
  const data = await response.json();

  localStorage.setItem(
    cacheKey,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    }),
  );

  return data;
};

function App() {
  const listaMaestra = usePokemonList();
  const [pokemonSeleccionado, setPokemonSeleccionado] = useState(null);
  const [esShiny, setEsShiny] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [historial, setHistorial] = useState(() => {
    const guardado = localStorage.getItem("historial");
    return guardado ? JSON.parse(guardado) : [];
  });
  const tablaEfectividad = useEfectividades(pokemonSeleccionado);
  const { habilidades, habilidadActiva, setHabilidadActiva } =
    useHabilidades(pokemonSeleccionado);
  const cadenaEvolutiva = useEvoluciones(pokemonSeleccionado);

  const handleSearch = async (nombrePokemon) => {
    try {
      setCargando(true);
      setError(null);
      const data = await obtenerPokemon(nombrePokemon);
      setPokemonSeleccionado(data);
      setEsShiny(false);

      setHistorial((prev) => {
        const filtrado = prev.filter((n) => n !== data.name);
        // Si el historial estaba lleno, elimina la caché del que sale
        if (filtrado.length === 20) {
          localStorage.removeItem(`pokemon_${filtrado[filtrado.length - 1]}`);
        }
        const nuevo = [data.name, ...filtrado].slice(0, 20);
        localStorage.setItem("historial", JSON.stringify(nuevo));
        return nuevo;
      });
    } catch (err) {
      setError(err.message);
      setPokemonSeleccionado(null);
    } finally {
      setCargando(false);
    }
  };

  const eliminarHistorial = (nombre) => {
    localStorage.removeItem(`pokemon_${nombre}`);
    setHistorial((prev) => {
      const nuevo = prev.filter((n) => n !== nombre);
      localStorage.setItem("historial", JSON.stringify(nuevo));
      return nuevo;
    });
  };

  const mostrarPaneles = !cargando && !error && pokemonSeleccionado;

  return (
    <div className="app-container">
      <Navbar
        onSearch={handleSearch}
        listaMaestra={listaMaestra}
        historial={historial}
        onEliminarHistorial={eliminarHistorial}
      />
      <main className={`main-layout ${!mostrarPaneles ? "main-empty" : ""}`}>
        {cargando ? (
          <div className="empty-state-content">
            <img
              src="/iconball.svg"
              alt="pokeball"
              className="empty-pokeball loading-spin"
            />
            <div className="empty-text">
              <h1 className="empty-title">
                PokeBattle<span>Helper</span>
              </h1>
              <p className="empty-subtitle">Buscando Pokémon...</p>
            </div>
          </div>
        ) : error ? (
          <div className="empty-state-content">
            <img
              src="/iconball.svg"
              alt="pokeball"
              className="empty-pokeball error-shake"
            />
            <div className="empty-text">
              <h1 className="empty-title">
                PokeBattle<span>Helper</span>
              </h1>
              <p className="empty-subtitle error-text">⚠ {error}</p>
            </div>
          </div>
        ) : !pokemonSeleccionado ? (
          <div className="empty-state-content">
            <img
              src="/iconball.svg"
              alt="pokeball"
              className="empty-pokeball"
            />
            <div className="empty-text">
              <h1 className="empty-title">
                PokeBattle<span>Helper</span>
              </h1>
              <p className="empty-subtitle">
                {"Busca un Pokémon para comenzar..."
                  .split("")
                  .map((letra, i) => (
                    <span
                      key={i}
                      style={{
                        display: "inline-block",
                        animation: `wave 1.2s ease-in-out infinite`,
                        animationDelay: `${i * 0.025}s`,
                      }}
                    >
                      {letra === " " ? "\u00A0" : letra}
                    </span>
                  ))}
              </p>
            </div>
          </div>
        ) : (
          <>
            <section className="left-panel">
              <PokemonCard
                pokemon={pokemonSeleccionado}
                esShiny={esShiny}
                onToggleShiny={() => setEsShiny(!esShiny)}
              />
            </section>
            <section className="right-panel">
              <PokemonInfo
                pokemon={pokemonSeleccionado}
                tablaEfectividad={tablaEfectividad}
                habilidades={habilidades}
                habilidadActiva={habilidadActiva}
                onSelectHabilidad={(nombre) =>
                  setHabilidadActiva(habilidadActiva === nombre ? null : nombre)
                }
                cadenaEvolutiva={cadenaEvolutiva}
              />
              <AbilityModal
                habilidades={habilidades}
                habilidadActiva={habilidadActiva}
                onClose={() => setHabilidadActiva(null)}
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
