import { useState } from "react";
import "./Navbar.css";

const Navbar = ({ onSearch, listaMaestra }) => {
  const [termino, setTermino] = useState("");
  const [sugerencias, setSugerencias] = useState([]);

  const manejarInput = (e) => {
    const valor = e.target.value.toLowerCase();
    setTermino(valor);

    if (valor.length > 1) {
      const filtrados = listaMaestra.filter((p) => p.name.includes(valor));
      setSugerencias(filtrados);
    } else {
      setSugerencias([]);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src="/public/iconball.svg" alt="Logo" className="brand-icon" />
        <span className="brand-name">
          PokeBattleHelper <small>v 1.0</small>
        </span>
      </div>
      <div className="search-container">
        <input
          type="text"
          value={termino}
          onChange={manejarInput}
          placeholder="pokemon name"
        />
        {sugerencias.length > 0 && (
          <ul className="sugerencias-lista">
            {sugerencias.map((p) => {
              const partes = p.url.split("/");
              const pokemonId = partes[partes.length - 2];
              return (
                <li
                  key={p.name}
                  className="sugerencia-item"
                  onClick={() => {
                    onSearch(p.name);
                    setSugerencias([]);
                    setTermino(p.name);
                  }}
                >
                  <span className="pokemon-id">
                    #{pokemonId.padStart(3, "0")}
                  </span>
                  {p.name}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="navbar-spacer"></div>
    </nav>
  );
};

export default Navbar;
