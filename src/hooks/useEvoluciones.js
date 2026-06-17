import { useState, useEffect } from "react";

const useEvoluciones = (pokemonSeleccionado) => {
  const [cadenaEvolutiva, setCadenaEvolutiva] = useState([]);

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

  return cadenaEvolutiva;
};

export default useEvoluciones;