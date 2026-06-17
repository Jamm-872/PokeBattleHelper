import { useState, useEffect } from "react";

const usePokemonList = () => {
  const [listaMaestra, setListaMaestra] = useState([]);

  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=-1")
      .then((res) => res.json())
      .then((data) => setListaMaestra(data.results));
  }, []);

  return listaMaestra;
};

export default usePokemonList;