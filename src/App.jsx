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

function App() {
  const listaMaestra = usePokemonList();
  const [pokemonSeleccionado, setPokemonSeleccionado] = useState(null);
  const tablaEfectividad = useEfectividades(pokemonSeleccionado);
  const { habilidades, habilidadActiva, setHabilidadActiva } =
    useHabilidades(pokemonSeleccionado);
  const [esShiny, setEsShiny] = useState(false);
  const cadenaEvolutiva = useEvoluciones(pokemonSeleccionado);

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

  return (
    <div className="app-container">
      <Navbar onSearch={handleSearch} listaMaestra={listaMaestra} />
      <main className="main-layout">
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
      </main>
    </div>
  );
}

export default App;
