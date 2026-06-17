import shiny_particle from "../../assets/shiny_particle.png";
import "./PokemonCard.css";

const PokemonCard = ({ pokemon, esShiny, onToggleShiny }) => {
  if (!pokemon) return null;

  return (
    <div className="poke-card">
      <div className="poke-header">
        <h2 style={{ textTransform: "capitalize" }}>
          #{pokemon.id.toString().padStart(3, "0")} - {pokemon.name}
        </h2>
        <button
          className={`btn-shiny ${esShiny ? "active" : ""}`}
          onClick={onToggleShiny}
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

      <div className="pokedex-screen-frame">
        <div className="screen-dots">
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        <div className="screen-display">
          <img
            src={
              esShiny
                ? pokemon.sprites.other["official-artwork"].front_shiny
                : pokemon.sprites.other["official-artwork"].front_default
            }
            alt={pokemon.name}
            className="poke-img"
          />
        </div>
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

      <div className="poke-stats-container">
        {pokemon.stats.map((item) => (
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
    </div>
  );
};

export default PokemonCard;