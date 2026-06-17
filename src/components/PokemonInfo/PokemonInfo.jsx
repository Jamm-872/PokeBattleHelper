import TypeBadge from "../TypeBadge/TypeBadge";
import ICONOS_TIPOS from "../../constants/tipo";
import "./PokemonInfo.css"

const PokemonInfo = ({
  pokemon,
  tablaEfectividad,
  habilidades,
  habilidadActiva,
  onSelectHabilidad,
  cadenaEvolutiva,
}) => {
  if (!pokemon) return null;

  return (
    <>
      <div className="info-scroll-box">
        <div className="section-header">
          <span className="accent-line"></span>
          <h2 className="right-panel-title">Tipos</h2>
        </div>
        <div className="compact-row">
          {pokemon.types.map((t) => (
            <div key={t.type.name} className={`type-badge ${t.type.name}`}>
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
          {tablaEfectividad.x4.map((tipo) => (
            <TypeBadge key={tipo} tipo={tipo} critico={true} />
          ))}
          {tablaEfectividad.x2.map((tipo) => (
            <TypeBadge key={tipo} tipo={tipo} />
          ))}
        </div>

        <div className="section-header">
          <span className="accent-line"></span>
          <h2 className="right-panel-title">Resistencias</h2>
        </div>
        <div className="compact-row">
          {tablaEfectividad.x05.map((tipo) => (
            <TypeBadge key={tipo} tipo={tipo} />
          ))}
          {tablaEfectividad.x025.map((tipo) => (
            <TypeBadge key={tipo} tipo={tipo} critico={true} />
          ))}
        </div>

        {tablaEfectividad.x0.length > 0 && (
          <>
            <div className="section-header">
              <span className="accent-line"></span>
              <h2 className="right-panel-title">Inmunidades</h2>
            </div>
            <div className="compact-row">
              {tablaEfectividad.x0.map((tipo) => (
                <TypeBadge key={tipo} tipo={tipo} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="section-header section-habilidades">
        <span className="accent-line"></span>
        <h2 className="right-panel-title">Habilidades</h2>
      </div>
      <div className="compact-row">
        {habilidades.map((hab) => (
          <div
            key={hab.nombre}
            className={`ability-badge ${hab.esOculta ? "hidden-ability" : ""} ${habilidadActiva === hab.nombre ? "active" : ""}`}
            onClick={() => onSelectHabilidad(hab.nombre)}
          >
            {hab.esOculta && <span className="hidden-tag">OCULTA</span>}
            <span className="ability-name">
              {hab.nombre.replace(/-/g, " ")}
            </span>
          </div>
        ))}
      </div>

      <div className="section-header section-evoluciones">
        <span className="accent-line"></span>
        <h2 className="right-panel-title">Evoluciones</h2>
      </div>
      <div className="evo-chain">
        {cadenaEvolutiva.map((fase, i) => (
          <div key={fase.nombre} className="evo-chain-item">
            <div className="evo-slot">
              <img src={fase.sprite} alt={fase.nombre} className="evo-sprite" />
              <span className="evo-name">{fase.nombre}</span>
            </div>
            {i < cadenaEvolutiva.length - 1 && (
              <span className="evo-arrow">→</span>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default PokemonInfo;
