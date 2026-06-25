import { useState } from "react";
import "./Navbar.css";

const Navbar = ({ onSearch, listaMaestra, historial, onEliminarHistorial }) => {
  const [termino, setTermino] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  const manejarInput = (e) => {
    const valor = e.target.value.toLowerCase();
    setTermino(valor);

    if (valor.length > 0) {
      const filtrados = listaMaestra.filter((p) => p.name.includes(valor));
      setSugerencias(filtrados);
      setMostrarHistorial(false);
    } else {
      setSugerencias([]);
      setMostrarHistorial(true);
    }
  };

  const manejarKeyDown = (e) => {
    if (e.key === "Enter" && termino.trim() !== "") {
      onSearch(termino.trim().toLowerCase());
      setSugerencias([]);
      setMostrarHistorial(false);
    }
  };

  const limpiarInput = () => {
    setTermino("");
    setSugerencias([]);
    setMostrarHistorial(true);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src="/iconball.svg" alt="Logo" className="brand-icon" />
        <span className="brand-name">
          PokeBattleHelper <small>v 1.0</small>
        </span>
      </div>
      <div className="search-container">
        <input
          type="text"
          value={termino}
          onChange={manejarInput}
          onKeyDown={manejarKeyDown}
          onFocus={() => { if (termino.length === 0) setMostrarHistorial(true); }}
          onBlur={() => setTimeout(() => setMostrarHistorial(false), 150)}
          placeholder="pokemon name"
        />
        {termino.length > 0 && (
          <button className="input-clear-btn" onClick={limpiarInput}>✕</button>
        )}

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
                  <span className="pokemon-id">#{pokemonId.padStart(3, "0")}</span>
                  {p.name}
                </li>
              );
            })}
          </ul>
        )}

        {mostrarHistorial && historial.length > 0 && sugerencias.length === 0 && (
          <ul className="sugerencias-lista">
            {historial.map((nombre) => (
              <li
                key={nombre}
                className="sugerencia-item historial-item"
                onClick={() => {
                  onSearch(nombre);
                  setTermino(nombre);
                  setMostrarHistorial(false);
                }}
              >
                <span className="historial-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </span>
                <span className="historial-nombre">{nombre}</span>
                <button
                  className="historial-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEliminarHistorial(nombre);
                  }}
                >✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="navbar-spacer"></div>
    </nav>
  );
};

export default Navbar;