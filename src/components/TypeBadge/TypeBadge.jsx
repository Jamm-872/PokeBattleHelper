import ICONOS_TIPOS from "../../constants/tipo";
import "./TypeBadge.css"

const TypeBadge = ({ tipo, critico = false }) => {
  if (!critico) {
    return (
      <div className={`type-badge ${tipo}`}>
        <div className="type-icon-circle">
          <img src={ICONOS_TIPOS[tipo]} alt={tipo} className="type-icon" />
        </div>
        <span className="type-text">{tipo}</span>
      </div>
    );
  }

  return (
    <div className="badge-with-tag">
      <div className={`type-badge-main ${tipo}`}>
        <div className="type-icon-circle">
          <img src={ICONOS_TIPOS[tipo]} alt={tipo} className="type-icon" />
        </div>
        <span className="type-text">{tipo}</span>
      </div>
      <div className="mult-tag-extension">x4</div>
    </div>
  );
};

export default TypeBadge;