import { colors, radii, safe } from "../theme";
import { isNative } from "../hooks/useCamera";

export default function UploadSheet({ onCamera, onLibrary, onFilePicker, onClose }) {
  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Add receipt"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: colors.surface,
          borderRadius: `${radii.xl}px ${radii.xl}px 0 0`,
          paddingBottom: `calc(16px + ${safe.bot})`,
          animation: "slideUp 0.25s ease",
        }}
      >
        {/* Handle */}
        <div style={{
          width: 36,
          height: 4,
          background: colors.border,
          borderRadius: 2,
          margin: "12px auto 16px",
        }} />

        <div style={{
          padding: "0 16px 8px",
          fontSize: 13,
          color: colors.muted,
          textAlign: "center",
          fontWeight: 600,
        }}>
          Add Receipt
        </div>

        {isNative ? (
          <>
            <SheetRow icon="📸" label="Take Photo" onClick={onCamera} />
            <SheetRow icon="🖼️" label="Choose from Library" onClick={onLibrary} />
          </>
        ) : (
          <SheetRow icon="📁" label="Choose File" onClick={onFilePicker} />
        )}

        <SheetRow
          icon={null}
          label="Cancel"
          onClick={onClose}
          style={{ color: colors.danger, fontWeight: 600, textAlign: "center", justifyContent: "center" }}
        />
      </div>
    </div>
  );
}

function SheetRow({ icon, label, onClick, style }) {
  return (
    <button
      onClick={onClick}
      className="sheet-row"
      style={{
        width: "100%",
        background: "none",
        border: "none",
        borderTop: `1px solid ${colors.border}`,
        padding: "16px 20px",
        color: colors.text,
        fontSize: 16,
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 14,
        ...style,
      }}
    >
      {icon && <span style={{ fontSize: 22 }}>{icon}</span>}
      {label}
    </button>
  );
}
