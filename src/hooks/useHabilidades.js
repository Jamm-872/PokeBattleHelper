import { useState, useEffect } from "react";

const useHabilidades = (pokemonSeleccionado) => {
  const [habilidades, setHabilidades] = useState([]);
  const [habilidadActiva, setHabilidadActiva] = useState(null);

  useEffect(() => {
    const cargarHabilidades = async () => {
      if (!pokemonSeleccionado) return;
      setHabilidadActiva(null);

      const promesas = pokemonSeleccionado.abilities.map(async (a) => {
        const res = await fetch(a.ability.url);
        const data = await res.json();
        const entradaEs = data.flavor_text_entries.find((e) => e.language.name === "es");
        const entradaEn = data.flavor_text_entries.find((e) => e.language.name === "en");
        return {
          nombre: a.ability.name,
          esOculta: a.is_hidden,
          descripcion: entradaEs
            ? entradaEs.flavor_text
            : entradaEn
              ? entradaEn.flavor_text
              : "Sin descripción disponible.",
        };
      });

      setHabilidades(await Promise.all(promesas));
    };

    cargarHabilidades();
  }, [pokemonSeleccionado]);

  return { habilidades, habilidadActiva, setHabilidadActiva };
};

export default useHabilidades;