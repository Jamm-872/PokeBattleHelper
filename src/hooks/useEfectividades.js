import { useState, useEffect } from "react";

const useEfectividades = (pokemonSeleccionado) => {
  const [tablaEfectividad, setTablaEfectividad] = useState({
    x4: [], x2: [], x05: [], x025: [], x0: [],
  });

  useEffect(() => {
    const calcularEfectividades = async () => {
      if (!pokemonSeleccionado) return;

      setTablaEfectividad({ x4: [], x2: [], x05: [], x025: [], x0: [] });

      const promesas = pokemonSeleccionado.types.map((t) =>
        fetch(t.type.url).then((res) => res.json()),
      );
      const datosTipos = await Promise.all(promesas);

      const resTipos = await fetch("https://pokeapi.co/api/v2/type");
      const { results: todosLosTipos } = await resTipos.json();

      const multiplicadoresFinales = {};

      todosLosTipos.forEach((tipoAtaque) => {
        if (tipoAtaque.name === "shadow" || tipoAtaque.name === "unknown") return;

        let mult = 1;

        datosTipos.forEach((tipoDefensor) => {
          const relaciones = tipoDefensor.damage_relations;
          if (relaciones.double_damage_from.some((t) => t.name === tipoAtaque.name)) mult *= 2;
          if (relaciones.half_damage_from.some((t) => t.name === tipoAtaque.name)) mult *= 0.5;
          if (relaciones.no_damage_from.some((t) => t.name === tipoAtaque.name)) mult *= 0;
        });

        if (mult !== 1) multiplicadoresFinales[tipoAtaque.name] = mult;
      });

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
    };

    calcularEfectividades();
  }, [pokemonSeleccionado]);

  return tablaEfectividad;
};

export default useEfectividades;