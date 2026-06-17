import "./AbilityModal.css"

const AbilityModal = ({ habilidades, habilidadActiva, onClose }) => {
  if (!habilidadActiva) return null;

  const habilidad = habilidades.find((h) => h.nombre === habilidadActiva);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3 className="modal-title">
          {habilidad?.esOculta && (
            <span className="hidden-tag" style={{ marginRight: "8px" }}>
              OCULTA
            </span>
          )}
          {habilidadActiva.replace(/-/g, " ")}
        </h3>
        <p className="modal-desc">{habilidad?.descripcion}</p>
      </div>
    </div>
  );
};

export default AbilityModal;