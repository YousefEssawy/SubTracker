/* @ds-bundle: {"format":4,"namespace":"SubTrackerDesignSystem_ae138e","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Select","sourcePath":"components/core/Select.jsx"},{"name":"BalanceCard","sourcePath":"components/finance/BalanceCard.jsx"},{"name":"CategoryForm","sourcePath":"components/finance/CategoryForm.jsx"},{"name":"FileUpload","sourcePath":"components/finance/FileUpload.jsx"},{"name":"FilterBar","sourcePath":"components/finance/FilterBar.jsx"},{"name":"RecurrenceForm","sourcePath":"components/finance/RecurrenceForm.jsx"},{"name":"SpaceForm","sourcePath":"components/finance/SpaceForm.jsx"},{"name":"TagInput","sourcePath":"components/finance/TagInput.jsx"},{"name":"TransactionListItem","sourcePath":"components/finance/TransactionListItem.jsx"},{"name":"AuthShell","sourcePath":"components/layout/AuthShell.jsx"},{"name":"BottomTabBar","sourcePath":"components/layout/BottomTabBar.jsx"},{"name":"Header","sourcePath":"components/layout/Header.jsx"},{"name":"Layout","sourcePath":"components/layout/Layout.jsx"},{"name":"Sidebar","sourcePath":"components/layout/Sidebar.jsx"},{"name":"ConfirmDialog","sourcePath":"components/ui/ConfirmDialog.jsx"},{"name":"Pagination","sourcePath":"components/ui/Pagination.jsx"},{"name":"RenewalDial","sourcePath":"components/ui/RenewalDial.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"d024de16e96c","components/core/Button.jsx":"4876cb51bd58","components/core/Card.jsx":"8b08590e18a9","components/core/Icon.jsx":"82c8fd323e63","components/core/Input.jsx":"384fdfaeb4d1","components/core/Select.jsx":"5cfc0952a9c1","components/finance/BalanceCard.jsx":"9d509babaa8b","components/finance/CategoryForm.jsx":"1932c82c8c59","components/finance/FileUpload.jsx":"d9c0d7d6800b","components/finance/FilterBar.jsx":"29403d4699c8","components/finance/RecurrenceForm.jsx":"79ed78ae2d4a","components/finance/SpaceForm.jsx":"7a2c2eee0ddb","components/finance/TagInput.jsx":"50ede8d5c73e","components/finance/TransactionListItem.jsx":"283edd42ca75","components/layout/AuthShell.jsx":"a5f64a743212","components/layout/BottomTabBar.jsx":"34944d5bbe11","components/layout/Header.jsx":"e87343f31b84","components/layout/Layout.jsx":"2ba7400a5837","components/layout/Sidebar.jsx":"4783bb14063d","components/ui/ConfirmDialog.jsx":"dbbc097ce2b9","components/ui/Pagination.jsx":"aad4d3994f92","components/ui/RenewalDial.jsx":"c53e1d010211","ui_kits/subtracker-app/DashboardScreen.jsx":"795f413dd9d3","ui_kits/subtracker-app/LoginScreen.jsx":"cc48e04ea604","ui_kits/subtracker-app/SettingsScreen.jsx":"c31fc0244fad","ui_kits/subtracker-app/SubscriptionsScreen.jsx":"0945cdc2cdcb","ui_kits/subtracker-app/TransactionsScreen.jsx":"16c2666acf81","ui_kits/subtracker-app/demoData.js":"7ed93c17d3da"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SubTrackerDesignSystem_ae138e = window.SubTrackerDesignSystem_ae138e || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
/**
 * Badge — small pill label. Intentional addition: the app inlines this
 * pattern ad-hoc (category filter chips, active filter chips, status
 * badges in SubscriptionsPage/CategoryForm) with slightly different
 * markup each time; this wraps the shared visual language.
 */
function Badge({
  tone = "primary",
  children,
  onRemove
}) {
  const toneStyles = {
    primary: {
      background: "var(--brand-primary-050)",
      color: "var(--brand-primary-600)"
    },
    success: {
      background: "var(--success-bg)",
      color: "var(--success-600)"
    },
    warning: {
      background: "var(--warning-bg)",
      color: "var(--warning-600)"
    },
    danger: {
      background: "var(--danger-bg)",
      color: "var(--danger-600)"
    },
    neutral: {
      background: "var(--ink-100)",
      color: "var(--ink-700)"
    }
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.375rem",
      padding: "0.25rem 0.65rem",
      borderRadius: "var(--radius-pill)",
      fontSize: "var(--text-caption)",
      fontWeight: 600,
      fontFamily: "var(--font-latin)",
      ...toneStyles[tone]
    }
  }, children, onRemove && /*#__PURE__*/React.createElement("button", {
    onClick: onRemove,
    "aria-label": "Remove",
    style: {
      border: "none",
      background: "none",
      cursor: "pointer",
      padding: 0,
      display: "inline-flex",
      opacity: 0.7,
      color: "inherit",
      font: "inherit"
    }
  }, "\u2715"));
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
/**
 * Button — thin wrapper around the app's existing .btn-primary / .btn-secondary /
 * .btn-danger utility classes (src/styles/globals.scss @layer components).
 * Intentional addition: the source styles these looks via CSS classes applied
 * directly to native <button> elements, with no dedicated React component.
 */
function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  onClick,
  children,
  className = ""
}) {
  const base = variant === "primary" ? "btn-primary" : variant === "danger" ? "btn-danger" : "btn-secondary";
  const sizeStyle = size === "sm" ? {
    padding: "0.4rem 1.1rem",
    fontSize: "var(--text-body-sm)"
  } : size === "lg" ? {
    padding: "0.85rem 2rem",
    fontSize: "var(--text-body)"
  } : undefined;
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    disabled: disabled,
    onClick: onClick,
    className: `${base} ${className}`,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      fontFamily: "var(--font-latin)",
      ...sizeStyle
    }
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
/**
 * Card — thin wrapper around .glass-card, the app's single card surface.
 * Intentional addition: applied directly as a className throughout the
 * codebase rather than through a component.
 */
function Card({
  children,
  style,
  className = "",
  padding = "20px"
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `glass-card ${className}`,
    style: {
      padding,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
/**
 * Icon — thin <img> wrapper around Heroicons v2 (outline), the exact icon
 * set the source app uses via `react-icons/hi2`. Source icons aren't
 * bundled as local SVG/font assets in the repo (react-icons resolves them
 * from its own package at build time), so per iconography guidance we link
 * the equivalent set from a CDN (jsDelivr mirrors the heroicons npm
 * package) rather than hand-drawing replacements.
 * Intentional addition — the source has no Icon component of its own.
 */
function Icon({
  name,
  size = 20,
  className = "",
  style,
  strokeWidth = 1.8
}) {
  return /*#__PURE__*/React.createElement("img", {
    src: `https://cdn.jsdelivr.net/npm/heroicons@2.1.5/24/outline/${name}.svg`,
    width: size,
    height: size,
    alt: "",
    "aria-hidden": "true",
    className: className,
    style: {
      display: "inline-block",
      ...style
    }
  });
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Input — thin wrapper around .input-field / .label-text.
 * Intentional addition (see Button.jsx note).
 */
function Input({
  label,
  error,
  className = "",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%"
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "label-text"
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    className: `input-field ${className}`,
    style: style
  }, rest)), error && /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: "0.25rem",
      fontSize: "var(--text-caption)",
      color: "var(--danger-500)"
    }
  }, error));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Select — thin wrapper around .select-field / .label-text.
 * Intentional addition (see Button.jsx note).
 */
function Select({
  label,
  children,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%"
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "label-text"
  }, label), /*#__PURE__*/React.createElement("select", _extends({
    className: `select-field ${className}`
  }, rest), children));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Select.jsx", error: String((e && e.message) || e) }); }

// components/finance/BalanceCard.jsx
try { (() => {
const CURRENCY_SYMBOLS = {
  EGP: "E£",
  USD: "$",
  EUR: "€",
  GBP: "£",
  SAR: "﷼",
  AED: "د.إ"
};
const fmt = value => new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(Math.abs(value));
function CurrencyBlock({
  currency,
  data,
  compact
}) {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const isPositive = data.balance >= 0;
  const toneColor = isPositive ? "var(--success-500)" : "var(--danger-500)";
  if (compact) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.5rem 0",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        color: "var(--text-secondary)",
        textTransform: "uppercase",
        letterSpacing: "0.04em"
      }
    }, currency), /*#__PURE__*/React.createElement("span", {
      className: "figure",
      style: {
        fontSize: 14,
        fontWeight: 700,
        color: toneColor
      }
    }, isPositive ? "+" : "-", symbol, " ", fmt(data.balance)));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "glass-card",
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: "var(--text-secondary)",
      textTransform: "uppercase",
      letterSpacing: "0.04em"
    }
  }, currency), /*#__PURE__*/React.createElement("span", {
    className: "figure",
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: toneColor
    }
  }, isPositive ? "+" : "-", symbol, " ", fmt(data.balance))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--success-bg)",
      borderRadius: "var(--radius-md)",
      padding: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 11,
      color: "var(--success-600)",
      fontWeight: 500,
      margin: "0 0 2px"
    }
  }, "Income"), /*#__PURE__*/React.createElement("p", {
    className: "figure",
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--success-600)",
      margin: 0
    }
  }, symbol, " ", fmt(data.income))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--danger-bg)",
      borderRadius: "var(--radius-md)",
      padding: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 11,
      color: "var(--danger-600)",
      fontWeight: 500,
      margin: "0 0 2px"
    }
  }, "Expense"), /*#__PURE__*/React.createElement("p", {
    className: "figure",
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--danger-600)",
      margin: 0
    }
  }, symbol, " ", fmt(data.expense)))));
}

/**
 * BalanceCard — per-currency income/expense/balance summary.
 * Ported from src/components/finance/BalanceCard.tsx.
 */
function BalanceCard({
  variant = "summary",
  balances = {}
}) {
  const currencies = Object.keys(balances);
  if (currencies.length === 0) {
    if (variant === "contextual") return null;
    return /*#__PURE__*/React.createElement("div", {
      className: "glass-card",
      style: {
        padding: 20,
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 14,
        color: "var(--text-tertiary)",
        margin: 0
      }
    }, "No financial data yet."));
  }
  if (variant === "contextual") {
    return /*#__PURE__*/React.createElement("div", {
      className: "glass-card",
      style: {
        padding: "16px 20px"
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        color: "var(--text-tertiary)",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        margin: "0 0 8px"
      }
    }, "Balance"), currencies.map(cur => /*#__PURE__*/React.createElement(CurrencyBlock, {
      key: cur,
      currency: cur,
      data: balances[cur],
      compact: true
    })));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 16,
      gridTemplateColumns: currencies.length === 1 ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))"
    }
  }, currencies.map(cur => /*#__PURE__*/React.createElement(CurrencyBlock, {
    key: cur,
    currency: cur,
    data: balances[cur],
    compact: false
  })));
}
Object.assign(__ds_scope, { BalanceCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/finance/BalanceCard.jsx", error: String((e && e.message) || e) }); }

// components/finance/CategoryForm.jsx
try { (() => {
const {
  useState
} = React;
/**
 * CategoryForm — modal for creating/editing an Income or Expense category.
 * Ported from src/components/finance/CategoryForm.tsx.
 */
function CategoryForm({
  category = null,
  onSubmit,
  onClose
}) {
  const isEditing = Boolean(category);
  const [name, setName] = useState(category?.name || "");
  const [type, setType] = useState(category?.type || "Income");
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => e.target === e.currentTarget && onClose(),
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.5)",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass-card",
    style: {
      width: "100%",
      maxWidth: 380,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-h4)",
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, isEditing ? "Edit Category" : "Create Category"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      border: "none",
      background: "none",
      padding: 8,
      cursor: "pointer",
      color: "var(--text-tertiary)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x-mark",
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, !isEditing ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "label-text"
  }, "Type"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      borderRadius: "var(--radius-md)",
      overflow: "hidden",
      border: "1px solid var(--border-default)"
    }
  }, ["Income", "Expense"].map(opt => /*#__PURE__*/React.createElement("button", {
    key: opt,
    onClick: () => setType(opt),
    style: {
      flex: 1,
      padding: "0.6rem 0",
      fontSize: 14,
      fontWeight: 500,
      border: "none",
      cursor: "pointer",
      background: type === opt ? opt === "Income" ? "var(--success-500)" : "var(--danger-500)" : "var(--surface-sunken)",
      color: type === opt ? "#fff" : "var(--text-secondary)"
    }
  }, opt)))) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "label-text"
  }, "Type"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-block",
      padding: "0.25rem 0.75rem",
      borderRadius: "var(--radius-pill)",
      fontSize: 13,
      fontWeight: 500,
      background: category.type === "Income" ? "var(--success-bg)" : "var(--danger-bg)",
      color: category.type === "Income" ? "var(--success-600)" : "var(--danger-600)"
    }
  }, category.type), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 4,
      fontSize: 11,
      color: "var(--text-tertiary)"
    }
  }, "Category type cannot be changed after creation.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "label-text"
  }, "Name"), /*#__PURE__*/React.createElement("input", {
    className: "input-field",
    value: name,
    onChange: e => setName(e.target.value),
    maxLength: 50,
    placeholder: type === "Income" ? "e.g. Salary, Freelance" : "e.g. Rent, Groceries"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 4,
      fontSize: 11,
      color: "var(--text-tertiary)"
    }
  }, name.length, "/50")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "primary",
    onClick: () => onSubmit?.({
      name,
      type
    })
  }, isEditing ? "Save Changes" : "Create Category")))));
}
Object.assign(__ds_scope, { CategoryForm });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/finance/CategoryForm.jsx", error: String((e && e.message) || e) }); }

// components/finance/FileUpload.jsx
try { (() => {
const {
  useState
} = React;
const ALLOWED = ["image/jpeg", "image/png", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024;
const formatSize = bytes => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/**
 * FileUpload — drag/drop or click-to-upload receipt/attachment field.
 * Ported from src/components/finance/FileUpload.tsx.
 */
function FileUpload({
  file,
  onFileSelect,
  onRemove
}) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = React.useRef(null);
  const validateAndSet = f => {
    setError("");
    if (!ALLOWED.includes(f.type)) return setError("Only JPEG, PNG, and PDF files are allowed.");
    if (f.size > MAX_SIZE) return setError(`File exceeds 5 MB limit (${formatSize(f.size)}).`);
    onFileSelect(f);
  };
  if (file) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-default)",
        background: "var(--surface-sunken)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--brand-primary-500)"
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: file.type?.startsWith("image/") ? "photo" : "document-text",
      size: 24
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 14,
        fontWeight: 500,
        color: "var(--text-primary)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, file.name), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 11,
        color: "var(--text-tertiary)"
      }
    }, formatSize(file.size))), /*#__PURE__*/React.createElement("button", {
      onClick: onRemove,
      style: {
        padding: 4,
        borderRadius: "var(--radius-sm)",
        border: "none",
        background: "none",
        color: "var(--text-tertiary)",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "x-mark",
      size: 16
    })));
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    onDragOver: e => {
      e.preventDefault();
      setDragOver(true);
    },
    onDragLeave: () => setDragOver(false),
    onDrop: e => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) validateAndSet(f);
    },
    onClick: () => inputRef.current?.click(),
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      borderRadius: "var(--radius-md)",
      cursor: "pointer",
      border: `2px dashed ${dragOver ? "var(--brand-primary-500)" : "var(--border-default)"}`,
      background: dragOver ? "var(--brand-primary-050)" : "transparent"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "cloud-arrow-up",
    size: 32,
    style: {
      marginBottom: 8,
      opacity: dragOver ? 1 : 0.5
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      color: "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--brand-primary-500)",
      fontWeight: 500
    }
  }, "Click to upload"), " or drag and drop"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "4px 0 0",
      fontSize: 11,
      color: "var(--text-tertiary)"
    }
  }, "JPEG, PNG or PDF up to 5 MB")), /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    type: "file",
    accept: ".jpg,.jpeg,.png,.pdf",
    onChange: e => e.target.files[0] && validateAndSet(e.target.files[0]),
    style: {
      display: "none"
    }
  }), error && /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 8,
      fontSize: 11,
      color: "var(--danger-500)"
    }
  }, error));
}
Object.assign(__ds_scope, { FileUpload });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/finance/FileUpload.jsx", error: String((e && e.message) || e) }); }

// components/finance/FilterBar.jsx
try { (() => {
const {
  useState
} = React;
/**
 * FilterBar — transaction list filter toolbar: type toggle, "more filters"
 * expansion (space/currency/tag/date-range), active-filter chips.
 * Ported from src/components/finance/FilterBar.tsx (simplified: static
 * demo data instead of SpaceContext/ViewportContext).
 */
function TypeButton({
  label,
  active,
  onClick,
  color
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      borderRadius: "var(--radius-pill)",
      padding: "0.375rem 0.9rem",
      fontSize: 14,
      fontWeight: 500,
      border: "none",
      cursor: "pointer",
      transition: "background var(--duration-base) var(--ease-standard)",
      background: active ? color : "var(--ink-100)",
      color: active ? "#fff" : "var(--text-secondary)"
    }
  }, label);
}
function FilterBar({
  spaces = [],
  filters,
  setFilters
}) {
  const [showMore, setShowMore] = useState(false);
  const hasActive = filters.spaceId || filters.type || filters.tag;
  const update = (key, value) => setFilters({
    ...filters,
    [key]: value
  });
  const clearAll = () => setFilters({});
  return /*#__PURE__*/React.createElement("div", {
    className: "glass-card",
    style: {
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "funnel",
    size: 16,
    style: {
      opacity: 0.5
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(TypeButton, {
    label: "All",
    active: !filters.type,
    onClick: () => update("type", undefined),
    color: "var(--brand-primary-500)"
  }), /*#__PURE__*/React.createElement(TypeButton, {
    label: "Income",
    active: filters.type === "Income",
    onClick: () => update("type", "Income"),
    color: "var(--success-500)"
  }), /*#__PURE__*/React.createElement(TypeButton, {
    label: "Expense",
    active: filters.type === "Expense",
    onClick: () => update("type", "Expense"),
    color: "var(--danger-500)"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowMore(!showMore),
    style: {
      marginLeft: "auto",
      border: "none",
      background: "none",
      color: "var(--brand-primary-500)",
      fontSize: 12,
      cursor: "pointer"
    }
  }, showMore ? "Less ▲" : "More ▼"), hasActive && /*#__PURE__*/React.createElement("button", {
    onClick: clearAll,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      border: "none",
      background: "none",
      color: "var(--text-tertiary)",
      fontSize: 12,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x-mark",
    size: 13
  }), " Clear")), showMore && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 16,
      paddingTop: 16,
      borderTop: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      color: "var(--text-tertiary)",
      display: "block",
      marginBottom: 4
    }
  }, "Space"), /*#__PURE__*/React.createElement("select", {
    className: "select-field",
    style: {
      fontSize: 13,
      padding: "0.4rem 0.75rem"
    }
  }, /*#__PURE__*/React.createElement("option", null, "All Spaces"), spaces.map(s => /*#__PURE__*/React.createElement("option", {
    key: s.id
  }, s.icon, " ", s.name)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      color: "var(--text-tertiary)",
      display: "block",
      marginBottom: 4
    }
  }, "Tag"), /*#__PURE__*/React.createElement("input", {
    className: "input-field",
    style: {
      fontSize: 13,
      padding: "0.4rem 0.75rem"
    },
    placeholder: "Filter by tag\u2026"
  }))), hasActive && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
      paddingTop: 12,
      borderTop: "1px solid var(--border-subtle)"
    }
  }, filters.type && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "0.25rem 0.65rem",
      borderRadius: "var(--radius-pill)",
      fontSize: 12,
      fontWeight: 500,
      background: "var(--brand-primary-050)",
      color: "var(--brand-primary-600)"
    }
  }, filters.type, /*#__PURE__*/React.createElement("button", {
    onClick: () => update("type", undefined),
    style: {
      border: "none",
      background: "none",
      padding: 0,
      display: "flex",
      color: "inherit"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x-mark",
    size: 12
  })))));
}
Object.assign(__ds_scope, { FilterBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/finance/FilterBar.jsx", error: String((e && e.message) || e) }); }

// components/finance/RecurrenceForm.jsx
try { (() => {
const {
  useState
} = React;
/**
 * RecurrenceForm — modal for scheduling an automated recurring
 * income/expense (space, category, amount, pattern/interval, dates).
 * Ported from src/components/finance/RecurrenceForm.tsx.
 */
const inputCls = "input-field";
function RecurrenceForm({
  spaces = [],
  categories = [],
  onClose,
  onSubmit
}) {
  const [type, setType] = useState("Expense");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      background: "rgba(0,0,0,0.5)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass-card",
    style: {
      width: "100%",
      maxWidth: 420,
      maxHeight: "90vh",
      overflowY: "auto",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-h4)",
      fontWeight: 700,
      color: "var(--text-primary)"
    }
  }, "Add Recurrence"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      border: "none",
      background: "none",
      padding: 6,
      cursor: "pointer",
      color: "var(--text-tertiary)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x-mark",
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      borderRadius: "var(--radius-md)",
      overflow: "hidden",
      border: "1px solid var(--border-default)"
    }
  }, ["Income", "Expense"].map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setType(t),
    style: {
      flex: 1,
      padding: "0.5rem 0",
      fontSize: 14,
      fontWeight: 500,
      border: "none",
      cursor: "pointer",
      background: type === t ? t === "Income" ? "var(--success-500)" : "var(--danger-500)" : "var(--surface-sunken)",
      color: type === t ? "#fff" : "var(--text-secondary)"
    }
  }, t))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "label-text"
  }, "Space"), /*#__PURE__*/React.createElement("select", {
    className: inputCls
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Select\u2026"), spaces.map(s => /*#__PURE__*/React.createElement("option", {
    key: s.id
  }, s.icon, " ", s.name)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "label-text"
  }, "Category"), /*#__PURE__*/React.createElement("select", {
    className: inputCls
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Select\u2026"), categories.map(c => /*#__PURE__*/React.createElement("option", {
    key: c.id
  }, c.name)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "label-text"
  }, "Amount"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: inputCls,
    placeholder: "0.00"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 100
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "label-text"
  }, "Currency"), /*#__PURE__*/React.createElement("select", {
    className: inputCls
  }, /*#__PURE__*/React.createElement("option", null, "EGP"), /*#__PURE__*/React.createElement("option", null, "USD")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "label-text"
  }, "Pattern"), /*#__PURE__*/React.createElement("select", {
    className: inputCls
  }, /*#__PURE__*/React.createElement("option", null, "Monthly"), /*#__PURE__*/React.createElement("option", null, "Weekly"), /*#__PURE__*/React.createElement("option", null, "Yearly"))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 100
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "label-text"
  }, "Every"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: inputCls,
    defaultValue: 1,
    min: 1
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "label-text"
  }, "Start Date"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: inputCls
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "label-text"
  }, "End Date (optional)"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: inputCls
  }))), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "primary",
    onClick: () => onSubmit?.()
  }, "Create Recurrence"))));
}
Object.assign(__ds_scope, { RecurrenceForm });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/finance/RecurrenceForm.jsx", error: String((e && e.message) || e) }); }

// components/finance/SpaceForm.jsx
try { (() => {
const {
  useState
} = React;
/**
 * SpaceForm — modal for creating/editing a "Space" (icon + color + name).
 * Ported from src/components/finance/SpaceForm.tsx.
 */
const SPACE_ICONS = ["💼", "🏠", "✈️", "🎓", "🛒", "🚗", "❤️", "🎮", "🍔", "💰"];
const SPACE_COLORS = ["#6366F1", "#EC4899", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"];
function SpaceForm({
  space = null,
  onSubmit,
  onClose
}) {
  const isEditing = Boolean(space);
  const [name, setName] = useState(space?.name || "");
  const [color, setColor] = useState(space?.color || SPACE_COLORS[0]);
  const [icon, setIcon] = useState(space?.icon || SPACE_ICONS[0]);
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => e.target === e.currentTarget && onClose(),
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.5)",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass-card",
    style: {
      width: "100%",
      maxWidth: 420,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-h4)",
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, isEditing ? "Edit Space" : "Create Space"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      border: "none",
      background: "none",
      padding: 8,
      cursor: "pointer",
      color: "var(--text-tertiary)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x-mark",
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "label-text"
  }, "Name"), /*#__PURE__*/React.createElement("input", {
    className: "input-field",
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: "e.g. Personal, Freelance, Household",
    maxLength: 50
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "label-text"
  }, "Icon"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(10, 1fr)",
      gap: 6
    }
  }, SPACE_ICONS.map(e => /*#__PURE__*/React.createElement("button", {
    key: e,
    onClick: () => setIcon(e),
    style: {
      fontSize: 18,
      padding: 6,
      borderRadius: "var(--radius-md)",
      border: "none",
      cursor: "pointer",
      background: icon === e ? "var(--brand-primary-100)" : "transparent",
      boxShadow: icon === e ? "0 0 0 2px var(--brand-primary-500)" : "none"
    }
  }, e)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "label-text"
  }, "Color"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      gap: 8
    }
  }, SPACE_COLORS.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    onClick: () => setColor(c),
    style: {
      height: 32,
      borderRadius: "var(--radius-md)",
      border: "none",
      cursor: "pointer",
      background: c,
      boxShadow: color === c ? "0 0 0 2px #fff, 0 0 0 4px var(--ink-400)" : "none"
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: 12,
      borderRadius: "var(--radius-md)",
      background: "var(--surface-sunken)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: "var(--radius-md)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
      background: color + "33"
    }
  }, icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      fontSize: 14,
      color: "var(--text-primary)"
    }
  }, name || "Space Name Preview"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: color,
      marginLeft: "auto"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    onClick: onClose
  }, "Cancel"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "primary",
    onClick: () => onSubmit?.({
      name,
      color,
      icon
    })
  }, isEditing ? "Save Changes" : "Create Space")))));
}
Object.assign(__ds_scope, { SpaceForm });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/finance/SpaceForm.jsx", error: String((e && e.message) || e) }); }

// components/finance/TagInput.jsx
try { (() => {
const {
  useState
} = React;
/**
 * TagInput — freeform tag entry with chips, enforcing max count/length.
 * Ported from src/components/finance/TagInput.tsx (react-i18next strings
 * hardcoded to English).
 */
function TagInput({
  tags = [],
  onChange,
  maxTags = 10,
  maxLength = 30
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const addTag = raw => {
    const tag = raw.toLowerCase().trim();
    if (!tag) return;
    if (tag.length > maxLength) return setError(`Tag cannot exceed ${maxLength} characters.`);
    if (tags.length >= maxTags) return setError(`Maximum ${maxTags} tags allowed.`);
    if (tags.includes(tag)) return setError("Tag already exists.");
    setError("");
    onChange([...tags, tag]);
    setInput("");
  };
  const removeTag = tag => {
    onChange(tags.filter(t => t !== tag));
    setError("");
  };
  const handleKeyDown = e => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) removeTag(tags[tags.length - 1]);
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 8
    }
  }, tags.map(tag => /*#__PURE__*/React.createElement("span", {
    key: tag,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "0.25rem 0.65rem",
      borderRadius: "var(--radius-pill)",
      fontSize: 12,
      fontWeight: 500,
      background: "var(--brand-primary-050)",
      color: "var(--brand-primary-600)"
    }
  }, "#", tag, /*#__PURE__*/React.createElement("button", {
    onClick: () => removeTag(tag),
    style: {
      border: "none",
      background: "none",
      cursor: "pointer",
      padding: 0,
      display: "flex",
      color: "inherit",
      opacity: 0.7
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x-mark",
    size: 12
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: input,
    onChange: e => {
      setInput(e.target.value);
      setError("");
    },
    onKeyDown: handleKeyDown,
    placeholder: tags.length >= maxTags ? "Max tags reached" : "Type a tag and press Enter…",
    disabled: tags.length >= maxTags,
    maxLength: maxLength,
    className: "input-field",
    style: {
      paddingRight: 56,
      fontSize: 14
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: 11,
      color: "var(--text-tertiary)"
    }
  }, tags.length, "/", maxTags)), error && /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 4,
      fontSize: 11,
      color: "var(--danger-500)"
    }
  }, error));
}
Object.assign(__ds_scope, { TagInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/finance/TagInput.jsx", error: String((e && e.message) || e) }); }

// components/finance/TransactionListItem.jsx
try { (() => {
/**
 * TransactionListItem — single row in a transaction list: category badge,
 * category/space/date, amount. Ported from
 * src/components/finance/TransactionListItem.tsx.
 */
function TransactionListItem({
  transaction,
  category,
  space,
  onClick
}) {
  const isIncome = transaction.type === "Income";
  const badgeColor = category?.color || space?.color || "#6366F1";
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "12px 16px",
      borderRadius: "var(--radius-lg)",
      cursor: "pointer"
    },
    onMouseEnter: e => e.currentTarget.style.background = "var(--surface-sunken)",
    onMouseLeave: e => e.currentTarget.style.background = "transparent"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      width: 40,
      height: 40,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
      color: "#fff",
      backgroundColor: badgeColor
    }
  }, category?.icon || space?.icon || "💼"), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontWeight: 600,
      color: "var(--text-primary)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, category?.name || "Unknown Category"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "2px 0 0",
      fontSize: 12,
      color: "var(--text-secondary)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, space?.name || "Unknown Space", " \xB7 ", transaction.transactionDate)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "figure",
    style: {
      margin: 0,
      fontWeight: 600,
      color: isIncome ? "var(--success-500)" : "var(--danger-500)"
    }
  }, isIncome ? "+" : "-", transaction.currency, " ", transaction.amount.toFixed(2)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "2px 0 0",
      fontSize: 11,
      fontWeight: 500,
      color: "var(--text-tertiary)"
    }
  }, isIncome ? "Income" : "Expense")));
}
Object.assign(__ds_scope, { TransactionListItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/finance/TransactionListItem.jsx", error: String((e && e.message) || e) }); }

// components/layout/AuthShell.jsx
try { (() => {
/**
 * AuthShell — split login/signup shell: gradient brand panel (desktop)
 * + form panel. Ported from src/components/layout/AuthShell.tsx.
 */
function AuthShell({
  variant = "login",
  title,
  subtitle,
  children
}) {
  const bullets = ["See your true monthly burn rate", "Never miss a renewal again", "Income vs expense at a glance"];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: 560,
      display: "flex",
      background: "var(--bg-page)",
      borderRadius: "var(--radius-xl)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "none"
    },
    className: "auth-brand-panel"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "44%",
      maxWidth: 380,
      background: "var(--gradient-primary)",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: 40,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 36,
      borderRadius: "var(--radius-md)",
      background: "rgba(255,255,255,0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: 700,
      fontFamily: "var(--font-display)"
    }
  }, "S"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#fff",
      fontWeight: 700,
      fontFamily: "var(--font-display)",
      fontSize: 18
    }
  }, "SubTracker")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      color: "#fff",
      fontFamily: "var(--font-display)",
      fontSize: 28,
      fontWeight: 700,
      lineHeight: 1.25,
      margin: "0 0 12px"
    }
  }, variant === "login" ? "Calm, clear control over every dollar that leaves your account." : "Start tracking in minutes. Feel in control by tonight."), variant === "login" ? /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 14,
      lineHeight: 1.6,
      margin: 0
    }
  }, "Join thousands tracking subscriptions and expenses without the spreadsheet stress.") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      marginTop: 16
    }
  }, bullets.map(b => /*#__PURE__*/React.createElement("div", {
    key: b,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      color: "rgba(255,255,255,0.9)",
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check-circle",
    size: 18,
    style: {
      filter: "invert(1) brightness(2)"
    }
  }), b)))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, variant === "login" ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "figure",
    style: {
      color: "#fff",
      fontSize: 22,
      fontWeight: 700,
      margin: 0
    }
  }, "$248"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(255,255,255,0.7)",
      fontSize: 11,
      margin: 0
    }
  }, "avg monthly spend")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "figure",
    style: {
      color: "#fff",
      fontSize: 22,
      fontWeight: 700,
      margin: 0
    }
  }, "6 days"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(255,255,255,0.7)",
      fontSize: 11,
      margin: 0
    }
  }, "to next renewal"))) : /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(255,255,255,0.7)",
      fontSize: 13,
      margin: 0
    }
  }, "No credit card required."))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 360
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 26,
      fontWeight: 700,
      color: "var(--text-primary)",
      margin: 0
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 6,
      color: "var(--text-secondary)",
      fontSize: 14
    }
  }, subtitle), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28
    }
  }, children))));
}
Object.assign(__ds_scope, { AuthShell });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/AuthShell.jsx", error: String((e && e.message) || e) }); }

// components/layout/BottomTabBar.jsx
try { (() => {
const TABS = [{
  path: "/dashboard",
  label: "Dashboard",
  icon: "home"
}, {
  path: "/subscriptions",
  label: "Subscriptions",
  icon: "credit-card"
}, {
  path: "/transactions",
  label: "Transactions",
  icon: "banknotes"
}, {
  path: "/spaces",
  label: "Spaces",
  icon: "rectangle-group"
}, {
  path: "/settings",
  label: "Settings",
  icon: "cog-6-tooth"
}];

/**
 * BottomTabBar — floating glass tab bar for mobile navigation.
 * Ported from src/components/layout/BottomTabBar.tsx.
 */
function BottomTabBar({
  activePath = "/dashboard"
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      position: "fixed",
      insetInline: 12,
      bottom: 12,
      zIndex: 40,
      borderRadius: "var(--radius-pill)",
      border: "1px solid var(--glass-border)",
      background: "var(--glass-fill)",
      backdropFilter: "blur(var(--glass-blur))",
      boxShadow: "var(--shadow-glass)",
      padding: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4
    }
  }, TABS.map(tab => {
    const active = tab.path === activePath;
    return /*#__PURE__*/React.createElement("a", {
      key: tab.path,
      href: "#",
      onClick: e => e.preventDefault(),
      style: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        borderRadius: "var(--radius-pill)",
        padding: "8px 6px",
        textDecoration: "none",
        fontSize: 10,
        fontWeight: 600,
        color: active ? "var(--brand-primary-600)" : "var(--text-secondary)",
        background: active ? "var(--brand-primary-050)" : "transparent"
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: tab.icon,
      size: 20
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "100%"
      }
    }, tab.label));
  })));
}
Object.assign(__ds_scope, { BottomTabBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/BottomTabBar.jsx", error: String((e && e.message) || e) }); }

// components/layout/Header.jsx
try { (() => {
/**
 * Header — sticky top bar: menu toggle, logo + current page title,
 * language toggle, theme toggle, notifications, profile menu.
 * Ported from src/components/layout/Header.tsx.
 */
function Header({
  pageTitle,
  theme = "light",
  onMenuToggle,
  onToggleTheme,
  hasNotifications = true,
  logoSrc
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 40,
      height: 64,
      flexShrink: 0,
      background: "var(--surface-card)",
      borderBottom: "1px solid var(--border-default)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      padding: "0 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onMenuToggle,
    style: {
      width: 36,
      height: 36,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-md)",
      border: "none",
      background: "none",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "bars-3",
    size: 20
  })), /*#__PURE__*/React.createElement("img", {
    src: logoSrc || (theme === "light" ? "../../assets/logo/light-mode.png" : "../../assets/logo/dark-mode.png"),
    alt: "SubTracker",
    style: {
      height: 32
    }
  }), pageTitle && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1,
      height: 24,
      background: "var(--border-default)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 15,
      color: "var(--text-primary)"
    }
  }, pageTitle))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      padding: "0 12px",
      height: 36,
      borderRadius: "var(--radius-pill)",
      border: "none",
      background: "none",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 500,
      color: "var(--text-secondary)"
    }
  }, "\u0639\u0631\u0628\u064A"), /*#__PURE__*/React.createElement("button", {
    onClick: onToggleTheme,
    style: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      border: "none",
      background: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: theme === "light" ? "moon" : "sun",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      border: "none",
      background: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "bell",
    size: 20
  })), hasNotifications && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "var(--danger-500)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: "50%",
      background: "var(--gradient-primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: 14,
      fontWeight: 700
    }
  }, "Y"))));
}
Object.assign(__ds_scope, { Header });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Header.jsx", error: String((e && e.message) || e) }); }

// components/layout/Sidebar.jsx
try { (() => {
const NAV_SECTIONS = [{
  key: "overview",
  label: "Overview",
  items: [{
    path: "/dashboard",
    label: "Dashboard",
    icon: "home"
  }]
}, {
  key: "money",
  label: "Money",
  items: [{
    path: "/transactions",
    label: "Transactions",
    icon: "banknotes"
  }, {
    path: "/subscriptions",
    label: "Subscriptions",
    icon: "credit-card"
  }, {
    path: "/recurrences",
    label: "Recurrences",
    icon: "arrow-path"
  }]
}, {
  key: "organize",
  label: "Organize",
  items: [{
    path: "/categories",
    label: "Categories",
    icon: "tag"
  }, {
    path: "/spaces",
    label: "Spaces",
    icon: "rectangle-group"
  }]
}, {
  key: "activity",
  label: "Activity",
  items: [{
    path: "/history",
    label: "History",
    icon: "clock"
  }]
}, {
  key: "account",
  label: "Account",
  items: [{
    path: "/settings",
    label: "Settings",
    icon: "cog-6-tooth"
  }, {
    path: "/how-to",
    label: "How to Use",
    icon: "book-open"
  }, {
    path: "/about",
    label: "About",
    icon: "information-circle"
  }]
}];

/**
 * Sidebar — desktop nav rail (collapsible) with sectioned links + Add
 * Subscription CTA. Ported from src/components/layout/Sidebar.tsx
 * (react-router Link swapped for <a>, framer-motion drawer omitted —
 * this shows the desktop rail only).
 */
function Sidebar({
  activePath = "/dashboard",
  collapsed = false
}) {
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      flexShrink: 0,
      width: collapsed ? 72 : 248,
      background: "var(--surface-card)",
      borderInlineEnd: "1px solid var(--border-default)",
      overflow: "hidden",
      transition: "width var(--duration-base) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("nav", {
    style: {
      flex: 1,
      padding: "16px 12px",
      overflowY: "auto"
    }
  }, NAV_SECTIONS.map(section => /*#__PURE__*/React.createElement("div", {
    key: section.key,
    style: {
      marginBottom: 8
    }
  }, !collapsed && /*#__PURE__*/React.createElement("p", {
    style: {
      padding: "12px 16px 4px",
      fontSize: 11,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.16em",
      color: "var(--text-tertiary)",
      margin: 0
    }
  }, section.label), section.items.map(item => {
    const active = item.path === activePath;
    return /*#__PURE__*/React.createElement("a", {
      key: item.path,
      href: "#",
      onClick: e => e.preventDefault(),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderRadius: "var(--radius-pill)",
        padding: collapsed ? "0.6rem" : "0.6rem 1rem",
        justifyContent: collapsed ? "center" : "flex-start",
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        textDecoration: "none",
        color: active ? "var(--brand-primary-600)" : "var(--text-secondary)",
        background: active ? "var(--brand-primary-050)" : "transparent"
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: item.icon,
      size: 20
    }), !collapsed && /*#__PURE__*/React.createElement("span", {
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, item.label));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-subtle)",
      padding: collapsed ? 12 : 16,
      display: "flex",
      justifyContent: collapsed ? "center" : "stretch"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: collapsed ? "" : "btn-primary",
    style: collapsed ? {
      width: 44,
      height: 44,
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      background: "var(--gradient-primary)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "var(--shadow-glow-primary)"
    } : {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "plus-circle",
    size: 20,
    style: {
      filter: "invert(1) brightness(2)"
    }
  }), !collapsed && "Add Subscription")));
}
Object.assign(__ds_scope, { Sidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Sidebar.jsx", error: String((e && e.message) || e) }); }

// components/layout/Layout.jsx
try { (() => {
/**
 * Layout — the authenticated app shell: Header on top, Sidebar + content
 * row below, BottomTabBar overlaid for mobile. Ported from
 * src/components/layout/Layout.tsx.
 */
function Layout({
  pageTitle,
  activePath,
  logoSrc,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      minHeight: 480,
      display: "flex",
      flexDirection: "column",
      background: "var(--bg-page)",
      overflow: "hidden",
      borderRadius: "var(--radius-lg)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Header, {
    pageTitle: pageTitle,
    logoSrc: logoSrc
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flex: 1,
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Sidebar, {
    activePath: activePath
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      minWidth: 0,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "120rem",
      margin: "0 auto",
      padding: "24px 20px"
    }
  }, children))));
}
Object.assign(__ds_scope, { Layout });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Layout.jsx", error: String((e && e.message) || e) }); }

// components/ui/ConfirmDialog.jsx
try { (() => {
/**
 * ConfirmDialog — modal confirmation for destructive/warning actions.
 * Ported from src/components/ui/ConfirmDialog.tsx (framer-motion swapped
 * for CSS transitions, react-i18next defaults hardcoded to English).
 */
function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger"
}) {
  if (!isOpen) return null;
  const tone = variant === "warning" ? "var(--warning-500)" : "var(--danger-500)";
  const toneBg = variant === "warning" ? "var(--warning-bg)" : "var(--danger-bg)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(4px)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "glass-card",
    style: {
      position: "relative",
      width: "100%",
      maxWidth: 380,
      padding: 24,
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      background: toneBg
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "exclamation-triangle",
    size: 28,
    style: {
      filter: variant === "warning" ? "none" : "none"
    }
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-h3)",
      fontWeight: 600,
      color: "var(--text-primary)",
      margin: "0 0 8px"
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--text-body-sm)",
      color: "var(--text-secondary)",
      margin: "0 0 24px"
    }
  }, message), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      width: "100%",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    onClick: onClose,
    className: ""
  }, cancelText), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: variant === "warning" ? "primary" : "danger",
    onClick: () => {
      onConfirm();
      onClose();
    }
  }, confirmText)))));
}
Object.assign(__ds_scope, { ConfirmDialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ui/ConfirmDialog.jsx", error: String((e && e.message) || e) }); }

// components/ui/Pagination.jsx
try { (() => {
/**
 * Pagination — page-size selector + prev/next controls for table-like lists.
 * Ported from src/components/ui/Pagination.tsx (react-i18next defaults
 * hardcoded to English).
 */
function Pagination({
  hasNext,
  hasPrev,
  goNext,
  goPrev,
  pageSize,
  setPageSize,
  pageSizeOptions = [10, 25, 50]
}) {
  const btnStyle = disabled => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "0.375rem 0.75rem",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--text-body-sm)",
    fontWeight: 500,
    border: "1px solid var(--border-default)",
    background: "transparent",
    color: "var(--text-secondary)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0.75rem 0.25rem",
      borderTop: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-caption)",
      color: "var(--text-secondary)"
    }
  }, "Rows:"), /*#__PURE__*/React.createElement("select", {
    value: pageSize,
    onChange: e => setPageSize(Number(e.target.value)),
    style: {
      fontSize: "var(--text-caption)",
      padding: "0.3rem 0.5rem",
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--border-default)",
      background: "var(--surface-card)",
      color: "var(--text-secondary)"
    }
  }, pageSizeOptions.map(s => /*#__PURE__*/React.createElement("option", {
    key: s,
    value: s
  }, s)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: goPrev,
    disabled: !hasPrev,
    style: btnStyle(!hasPrev)
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "arrow-left",
    size: 14
  }), " Prev"), /*#__PURE__*/React.createElement("button", {
    onClick: goNext,
    disabled: !hasNext,
    style: btnStyle(!hasNext)
  }, "Next ", /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "arrow-right",
    size: 14
  }))));
}
Object.assign(__ds_scope, { Pagination });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ui/Pagination.jsx", error: String((e && e.message) || e) }); }

// components/ui/RenewalDial.jsx
try { (() => {
const CYCLE_DAYS = {
  weekly: 7,
  monthly: 30,
  yearly: 365,
  custom: 30
};

/**
 * RenewalDial — the app's signature "how far through the billing cycle"
 * indicator. A ring fills as the next renewal approaches so the countdown
 * reads at a glance. Ported from src/components/ui/RenewalDial.tsx
 * (framer-motion transition swapped for a plain CSS transition).
 */
function RenewalDial({
  icon,
  iconColor,
  daysUntil,
  billingCycle = "monthly",
  customCycleDays,
  size = 44
}) {
  const cycleDays = billingCycle === "custom" ? customCycleDays || CYCLE_DAYS.custom : CYCLE_DAYS[billingCycle];
  const progress = Math.min(1, Math.max(0, (cycleDays - daysUntil) / cycleDays));
  const isPastDue = daysUntil < 0;
  const ringColor = isPastDue ? "var(--danger-500)" : daysUntil <= 3 ? "var(--danger-500)" : daysUntil <= 7 ? "var(--warning-500)" : "var(--brand-primary-500)";
  const stroke = 3;
  const radius = size / 2 - stroke;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - (isPastDue ? 1 : progress));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: size,
      height: size,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: `0 0 ${size} ${size}`,
    style: {
      position: "absolute",
      inset: 0,
      transform: "rotate(-90deg)"
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: radius,
    strokeWidth: stroke,
    fill: "none",
    stroke: "var(--ink-200)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: radius,
    strokeWidth: stroke,
    strokeLinecap: "round",
    fill: "none",
    stroke: ringColor,
    strokeDasharray: circumference,
    strokeDashoffset: dashOffset,
    style: {
      transition: "stroke-dashoffset 500ms var(--ease-standard)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: stroke + 3,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: Math.max(12, size * 0.36),
      backgroundColor: iconColor + "20"
    }
  }, icon));
}
Object.assign(__ds_scope, { RenewalDial });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ui/RenewalDial.jsx", error: String((e && e.message) || e) }); }

// ui_kits/subtracker-app/DashboardScreen.jsx
try { (() => {
// DashboardScreen — ported from src/pages/DashboardPage.tsx (recharts BarChart
// replaced with plain CSS bars; count-up animation omitted for a static demo).
function DashboardScreen() {
  const {
    RenewalDial
  } = window.SubTrackerDesignSystem_ae138e;
  const {
    CATEGORIES,
    SUBSCRIPTIONS,
    TREND,
    MONTH_LABELS
  } = window.SubTrackerDemoData;
  const active = SUBSCRIPTIONS.filter(s => s.status === "active");
  const monthlyTotal = active.reduce((sum, s) => sum + s.price, 0);
  const nextRenewal = [...active].filter(s => s.daysUntil >= 0).sort((a, b) => a.daysUntil - b.daysUntil)[0];
  const upcoming = [...active].filter(s => s.daysUntil >= 0).sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 5);
  const income = 8500;
  const expense = monthlyTotal;
  const flowMax = Math.max(income, expense, 1);
  const byCategory = {};
  active.forEach(s => {
    const cat = CATEGORIES[s.category];
    byCategory[cat.name] = byCategory[cat.name] || {
      value: 0,
      color: cat.color
    };
    byCategory[cat.name].value += s.price;
  });
  const catRows = Object.entries(byCategory).sort((a, b) => b[1].value - a[1].value);
  const catMax = catRows[0]?.[1].value || 1;
  const trendMax = Math.max(...TREND);
  const statCard = (label, value, delta, tone) => /*#__PURE__*/React.createElement("div", {
    className: "glass-card",
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      color: "var(--text-secondary)",
      fontWeight: 500
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "figure",
    style: {
      marginTop: 8,
      fontFamily: "var(--font-display)",
      fontSize: 28,
      fontWeight: 700,
      color: "var(--text-primary)"
    }
  }, value), delta && /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 8,
      fontSize: 12,
      fontWeight: 600,
      color: tone === "warn" ? "var(--warning-500)" : tone === "danger" ? "var(--danger-500)" : tone === "success" ? "var(--success-500)" : "var(--text-tertiary)"
    }
  }, delta));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: 26,
      fontWeight: 700,
      color: "var(--text-primary)"
    }
  }, "Good morning, Yousef"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "4px 0 0",
      fontSize: 14,
      color: "var(--text-secondary)"
    }
  }, "Here's what's happening with your money.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: 16
    }
  }, statCard("Monthly burn rate", `E£ ${monthlyTotal.toFixed(2)}`, `E£ ${(monthlyTotal * 12).toFixed(2)} / year`, "muted"), statCard("Next renewal", nextRenewal ? `${nextRenewal.daysUntil} days` : "—", nextRenewal ? `${nextRenewal.name} · E£ ${nextRenewal.price}` : "", nextRenewal && nextRenewal.daysUntil <= 3 ? "warn" : "muted"), statCard("Income", `E£ ${income.toFixed(2)}`, "Total logged income", "success"), statCard("Expense", `E£ ${expense.toFixed(2)}`, "Total logged expense", "danger")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr",
      gap: 24,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 24,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass-card",
    style: {
      padding: 20,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      alignSelf: "flex-start",
      margin: "0 0 12px",
      fontFamily: "var(--font-display)",
      fontSize: 15,
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, "Next renewal"), nextRenewal && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(RenewalDial, {
    icon: CATEGORIES[nextRenewal.category].icon,
    iconColor: CATEGORIES[nextRenewal.category].color,
    daysUntil: nextRenewal.daysUntil,
    billingCycle: "monthly",
    size: 110
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "12px 0 0",
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, nextRenewal.name), /*#__PURE__*/React.createElement("p", {
    className: "figure",
    style: {
      margin: 0,
      fontSize: 12,
      color: "var(--text-tertiary)"
    }
  }, "in ", nextRenewal.daysUntil, " days"))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card",
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 16px",
      fontFamily: "var(--font-display)",
      fontSize: 15,
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, "Income vs expense"), [["Income", income, "var(--success-500)"], ["Expense", expense, "var(--danger-500)"]].map(([label, val, color]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 13,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-secondary)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "figure",
    style: {
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, "E\xA3 ", val.toFixed(2))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 10,
      borderRadius: 5,
      background: "var(--ink-100)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: `${val / flowMax * 100}%`,
      background: color,
      borderRadius: 5
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      paddingTop: 12,
      borderTop: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--text-secondary)"
    }
  }, "Net"), /*#__PURE__*/React.createElement("span", {
    className: "figure",
    style: {
      fontWeight: 700,
      color: income - expense >= 0 ? "var(--success-500)" : "var(--danger-500)"
    }
  }, income - expense >= 0 ? "+" : "-", "E\xA3 ", Math.abs(income - expense).toFixed(2))))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card",
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 16px",
      fontFamily: "var(--font-display)",
      fontSize: 15,
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, "Spending trend"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 6,
      height: 140
    }
  }, TREND.map((v, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: `${v / trendMax * 110}px`,
      borderRadius: "4px 4px 0 0",
      background: i === TREND.length - 1 ? "var(--warning-500)" : "var(--brand-primary-500)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: "var(--text-tertiary)"
    }
  }, MONTH_LABELS[i]))))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card",
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 16px",
      fontFamily: "var(--font-display)",
      fontSize: 15,
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, "Spending by category"), catRows.map(([name, d]) => /*#__PURE__*/React.createElement("div", {
    key: name,
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 13,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-secondary)"
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    className: "figure",
    style: {
      color: "var(--text-primary)"
    }
  }, "E\xA3 ", d.value.toFixed(0))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      borderRadius: 4,
      background: "var(--ink-100)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: `${d.value / catMax * 100}%`,
      background: d.color,
      borderRadius: 4
    }
  })))))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card",
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: 15,
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, "Upcoming renewals"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--brand-primary-500)",
      cursor: "pointer"
    }
  }, "View all")), upcoming.map(sub => {
    const cat = CATEGORIES[sub.category];
    return /*#__PURE__*/React.createElement("div", {
      key: sub.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: cat.color,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: 14,
        flexShrink: 0
      }
    }, sub.name.charAt(0)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 13,
        fontWeight: 500,
        color: "var(--text-primary)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, sub.name)), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "right",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "figure",
      style: {
        margin: 0,
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, "E\xA3 ", sub.price), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 11,
        fontWeight: 500,
        color: sub.daysUntil <= 3 ? "var(--danger-500)" : "var(--warning-500)"
      }
    }, sub.daysUntil, " days")));
  }))));
}
window.DashboardScreen = DashboardScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/subtracker-app/DashboardScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/subtracker-app/LoginScreen.jsx
try { (() => {
// LoginScreen — ported from src/pages/LoginPage.tsx, wrapped in AuthShell.
function LoginScreen({
  onLogin
}) {
  const {
    AuthShell,
    Icon,
    Button
  } = window.SubTrackerDesignSystem_ae138e;
  const [showPwd, setShowPwd] = React.useState(false);
  return /*#__PURE__*/React.createElement(AuthShell, {
    variant: "login",
    title: "Welcome back",
    subtitle: "Log in to see where your money is going."
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onLogin();
    },
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "label-text"
  }, "Email"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "envelope",
    size: 18,
    style: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)",
      opacity: 0.4
    }
  }), /*#__PURE__*/React.createElement("input", {
    type: "email",
    className: "input-field",
    placeholder: "you@example.com",
    style: {
      paddingLeft: 38
    },
    required: true
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "label-text",
    style: {
      margin: 0
    }
  }, "Password"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      fontSize: 12,
      color: "var(--brand-primary-500)",
      fontWeight: 500
    }
  }, "Forgot password?")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "lock-closed",
    size: 18,
    style: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)",
      opacity: 0.4
    }
  }), /*#__PURE__*/React.createElement("input", {
    type: showPwd ? "text" : "password",
    className: "input-field",
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    style: {
      paddingLeft: 38,
      paddingRight: 38
    },
    required: true
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShowPwd(!showPwd),
    style: {
      position: "absolute",
      right: 10,
      top: "50%",
      transform: "translateY(-50%)",
      border: "none",
      background: "none",
      cursor: "pointer",
      color: "var(--text-tertiary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: showPwd ? "eye-slash" : "eye",
    size: 18
  })))), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    size: "lg"
  }, "Log in")), /*#__PURE__*/React.createElement("button", {
    style: {
      marginTop: 12,
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: "0.75rem",
      background: "var(--surface-card)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-pill)",
      fontWeight: 500,
      fontSize: 14,
      color: "var(--text-secondary)",
      cursor: "pointer"
    }
  }, "Continue with Google"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 24,
      textAlign: "center",
      fontSize: 13,
      color: "var(--text-secondary)"
    }
  }, "New here? ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      color: "var(--brand-primary-500)",
      fontWeight: 500
    }
  }, "Create an account")));
}
window.LoginScreen = LoginScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/subtracker-app/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/subtracker-app/SettingsScreen.jsx
try { (() => {
// SettingsScreen — ported from src/pages/SettingsPage.tsx.
function SettingsScreen({
  theme,
  onToggleTheme
}) {
  const {
    Icon,
    Button,
    Select
  } = window.SubTrackerDesignSystem_ae138e;
  const [saved, setSaved] = React.useState(false);
  const sectionLabel = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-tertiary)"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 640,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: 24,
      fontWeight: 700,
      color: "var(--text-primary)"
    }
  }, "Settings"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    onClick: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    }
  }, saved ? "Saved!" : "Save Preferences")), /*#__PURE__*/React.createElement("div", {
    className: "glass-card",
    style: {
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: sectionLabel
  }, "Profile"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: "var(--radius-lg)",
      background: "var(--gradient-primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: 24,
      fontWeight: 700
    }
  }, "Y"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, "Yousef Essawy"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13,
      color: "var(--text-tertiary)"
    }
  }, "yousef@example.com")))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card",
    style: {
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: sectionLabel
  }, "Appearance"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      width: "100%",
      borderRadius: "var(--radius-pill)",
      background: "var(--ink-100)",
      padding: 4
    }
  }, ["light", "dark"].map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => t !== theme && onToggleTheme(),
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: "0.6rem 0",
      borderRadius: "var(--radius-pill)",
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 500,
      background: theme === t ? "var(--surface-card)" : "transparent",
      color: theme === t ? "var(--brand-primary-500)" : "var(--text-secondary)",
      boxShadow: theme === t ? "var(--shadow-card)" : "none"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: t === "light" ? "sun" : "moon",
    size: 18
  }), t === "light" ? "Light" : "Dark")))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card",
    style: {
      padding: 24,
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: sectionLabel
  }, "Preferences"), /*#__PURE__*/React.createElement(Select, {
    label: "Display Currency",
    defaultValue: "EGP"
  }, /*#__PURE__*/React.createElement("option", {
    value: "EGP"
  }, "E\xA3 EGP - Egyptian Pound"), /*#__PURE__*/React.createElement("option", {
    value: "USD"
  }, "$ USD - US Dollar"), /*#__PURE__*/React.createElement("option", {
    value: "EUR"
  }, "\u20AC EUR - Euro")), /*#__PURE__*/React.createElement(Select, {
    label: "Reminder Days Before Renewal",
    defaultValue: "3"
  }, /*#__PURE__*/React.createElement("option", {
    value: "1"
  }, "1 day before"), /*#__PURE__*/React.createElement("option", {
    value: "3"
  }, "3 days before"), /*#__PURE__*/React.createElement("option", {
    value: "7"
  }, "7 days before"))));
}
window.SettingsScreen = SettingsScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/subtracker-app/SettingsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/subtracker-app/SubscriptionsScreen.jsx
try { (() => {
// SubscriptionsScreen — ported from src/pages/SubscriptionsPage.tsx
// (grouped by urgency: overdue / due soon / this month / later / paused).
function SubscriptionsScreen() {
  const {
    Icon,
    Button
  } = window.SubTrackerDesignSystem_ae138e;
  const {
    CATEGORIES,
    SUBSCRIPTIONS
  } = window.SubTrackerDemoData;
  const withCat = SUBSCRIPTIONS.map(s => ({
    ...s,
    cat: CATEGORIES[s.category]
  }));
  const active = withCat.filter(s => s.status === "active").sort((a, b) => a.daysUntil - b.daysUntil);
  const groups = [{
    label: "Overdue",
    color: "#EF4444",
    items: active.filter(s => s.daysUntil < 0)
  }, {
    label: "Due soon",
    color: "#F59E0B",
    items: active.filter(s => s.daysUntil >= 0 && s.daysUntil <= 7)
  }, {
    label: "This month",
    color: "#6366F1",
    items: active.filter(s => s.daysUntil > 7 && s.daysUntil <= 30)
  }, {
    label: "Paused",
    color: "#94A3B8",
    items: withCat.filter(s => s.status === "paused")
  }];
  const total = active.reduce((s, sub) => s + sub.price, 0);
  const Row = ({
    sub
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "12px 16px",
      borderRadius: "var(--radius-lg)",
      opacity: sub.status !== "active" ? 0.6 : 1
    },
    onMouseEnter: e => e.currentTarget.style.background = "var(--surface-sunken)",
    onMouseLeave: e => e.currentTarget.style.background = "transparent"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      borderRadius: "50%",
      background: sub.cat.color,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      flexShrink: 0
    }
  }, sub.name.charAt(0)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontWeight: 600,
      color: "var(--text-primary)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, sub.name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "2px 0 0",
      fontSize: 12,
      color: "var(--text-secondary)"
    }
  }, "Monthly \xB7 ", sub.cat.name)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "figure",
    style: {
      margin: 0,
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, "E\xA3 ", sub.price), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 11,
      fontWeight: 500,
      color: sub.daysUntil < 0 ? "var(--danger-500)" : sub.daysUntil <= 7 ? "var(--warning-500)" : "var(--text-tertiary)"
    }
  }, sub.status !== "active" ? "Paused" : sub.daysUntil < 0 ? `Overdue by ${Math.abs(sub.daysUntil)}d` : `in ${sub.daysUntil}d`)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      border: "none",
      background: "none",
      padding: 6,
      borderRadius: "var(--radius-sm)",
      cursor: "pointer",
      color: "var(--text-tertiary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: sub.status === "active" ? "pause" : "play",
    size: 16
  })), /*#__PURE__*/React.createElement("button", {
    style: {
      border: "none",
      background: "none",
      padding: 6,
      borderRadius: "var(--radius-sm)",
      cursor: "pointer",
      color: "var(--text-tertiary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pencil-square",
    size: 16
  })), /*#__PURE__*/React.createElement("button", {
    style: {
      border: "none",
      background: "none",
      padding: 6,
      borderRadius: "var(--radius-sm)",
      cursor: "pointer",
      color: "var(--text-tertiary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash",
    size: 16
  }))));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: 24,
      fontWeight: 700,
      color: "var(--text-primary)"
    }
  }, "Subscriptions"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "4px 0 0",
      fontSize: 13,
      color: "var(--text-secondary)"
    }
  }, active.length, " active \xB7 ", /*#__PURE__*/React.createElement("span", {
    className: "figure"
  }, "E\xA3 ", total.toFixed(2)), " / mo")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "magnifying-glass",
    size: 16,
    style: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)",
      opacity: 0.4
    }
  }), /*#__PURE__*/React.createElement("input", {
    className: "input-field",
    placeholder: "Search subscriptions\u2026",
    style: {
      paddingLeft: 34,
      width: 200,
      fontSize: 13
    }
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm"
  }, "+ Add New"))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card",
    style: {
      padding: 10
    }
  }, groups.filter(g => g.items.length > 0).map(g => /*#__PURE__*/React.createElement("div", {
    key: g.label,
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "4px 16px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: g.color
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "var(--text-primary)"
    }
  }, g.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-tertiary)"
    }
  }, g.items.length)), g.items.map(sub => /*#__PURE__*/React.createElement(Row, {
    key: sub.id,
    sub: sub
  }))))));
}
window.SubscriptionsScreen = SubscriptionsScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/subtracker-app/SubscriptionsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/subtracker-app/TransactionsScreen.jsx
try { (() => {
// TransactionsScreen — combines src/pages/TransactionsPage.tsx +
// HistoryPage.tsx patterns: balance summary, filter bar, transaction list.
function TransactionsScreen() {
  const {
    BalanceCard,
    FilterBar,
    TransactionListItem,
    Icon,
    Button
  } = window.SubTrackerDesignSystem_ae138e;
  const {
    CATEGORIES,
    SPACES,
    TRANSACTIONS
  } = window.SubTrackerDemoData;
  const [filters, setFilters] = React.useState({});
  const filtered = TRANSACTIONS.filter(t => !filters.type || t.type === filters.type);
  const balances = {
    EGP: {
      balance: 8500 - 1250,
      income: 8500,
      expense: 1250
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: 24,
      fontWeight: 700,
      color: "var(--text-primary)"
    }
  }, "Transactions"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "4px 0 0",
      fontSize: 13,
      color: "var(--text-secondary)"
    }
  }, "Track your income and expenses.")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm"
  }, "+ Add")), /*#__PURE__*/React.createElement(BalanceCard, {
    variant: "summary",
    balances: balances
  }), /*#__PURE__*/React.createElement(FilterBar, {
    spaces: SPACES,
    filters: filters,
    setFilters: setFilters
  }), /*#__PURE__*/React.createElement("div", {
    className: "glass-card",
    style: {
      padding: 8
    }
  }, filtered.map(t => {
    const cat = t.category ? CATEGORIES[t.category] : {
      name: t.label,
      icon: t.icon,
      color: t.color
    };
    const space = SPACES.find(s => s.id === t.space);
    return /*#__PURE__*/React.createElement(TransactionListItem, {
      key: t.id,
      transaction: {
        type: t.type,
        amount: t.amount,
        currency: t.currency,
        transactionDate: t.date
      },
      category: cat,
      space: space
    });
  }), filtered.length === 0 && /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: "center",
      padding: 32,
      color: "var(--text-tertiary)",
      fontSize: 13
    }
  }, "No transactions match the current filters.")));
}
window.TransactionsScreen = TransactionsScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/subtracker-app/TransactionsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/subtracker-app/demoData.js
try { (() => {
/**
 * Shared demo data for the SubTracker UI kit — mirrors utils/categories.ts
 * and utils/currencies.ts in the source app, condensed for a click-through
 * demo (illustrative, not live data).
 */
const CATEGORIES = {
  streaming: {
    name: "Streaming",
    icon: "🎬",
    color: "#EF4444"
  },
  software: {
    name: "Software",
    icon: "💻",
    color: "#6366F1"
  },
  ai: {
    name: "AI Subscription",
    icon: "🤖",
    color: "#10B981"
  },
  cloud: {
    name: "Cloud & Storage",
    icon: "☁️",
    color: "#06B6D4"
  },
  gaming: {
    name: "Gaming",
    icon: "🎮",
    color: "#8B5CF6"
  },
  health: {
    name: "Health & Fitness",
    icon: "💪",
    color: "#EC4899"
  }
};
const SPACES = [{
  id: "personal",
  name: "Personal",
  icon: "💼",
  color: "#6366F1"
}, {
  id: "household",
  name: "Household",
  icon: "🏠",
  color: "#EC4899"
}];
const SUBSCRIPTIONS = [{
  id: "1",
  name: "Netflix",
  category: "streaming",
  price: 250,
  currency: "EGP",
  daysUntil: 2,
  billingCycle: "monthly",
  status: "active"
}, {
  id: "2",
  name: "ChatGPT Plus",
  category: "ai",
  price: 380,
  currency: "EGP",
  daysUntil: 12,
  billingCycle: "monthly",
  status: "active"
}, {
  id: "3",
  name: "iCloud+",
  category: "cloud",
  price: 45,
  currency: "EGP",
  daysUntil: 20,
  billingCycle: "monthly",
  status: "active"
}, {
  id: "4",
  name: "Adobe CC",
  category: "software",
  price: 620,
  currency: "EGP",
  daysUntil: -1,
  billingCycle: "monthly",
  status: "active"
}, {
  id: "5",
  name: "Xbox Game Pass",
  category: "gaming",
  price: 190,
  currency: "EGP",
  daysUntil: 27,
  billingCycle: "monthly",
  status: "active"
}, {
  id: "6",
  name: "Fitness+",
  category: "health",
  price: 90,
  currency: "EGP",
  daysUntil: 5,
  billingCycle: "monthly",
  status: "paused"
}];
const TRANSACTIONS = [{
  id: "t1",
  type: "Expense",
  category: "streaming",
  space: "household",
  amount: 250,
  currency: "EGP",
  date: "Jul 6"
}, {
  id: "t2",
  type: "Income",
  category: null,
  space: "personal",
  amount: 8500,
  currency: "EGP",
  date: "Jul 1",
  label: "Salary",
  icon: "💰",
  color: "#10B981"
}, {
  id: "t3",
  type: "Expense",
  category: "software",
  space: "personal",
  amount: 620,
  currency: "EGP",
  date: "Jun 29"
}, {
  id: "t4",
  type: "Expense",
  category: "ai",
  space: "personal",
  amount: 380,
  currency: "EGP",
  date: "Jun 24"
}];
const TREND = [420, 460, 440, 510, 490, 530, 500, 540, 560, 520, 570, 585];
const MONTH_LABELS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
window.SubTrackerDemoData = {
  CATEGORIES,
  SPACES,
  SUBSCRIPTIONS,
  TRANSACTIONS,
  TREND,
  MONTH_LABELS
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/subtracker-app/demoData.js", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.BalanceCard = __ds_scope.BalanceCard;

__ds_ns.CategoryForm = __ds_scope.CategoryForm;

__ds_ns.FileUpload = __ds_scope.FileUpload;

__ds_ns.FilterBar = __ds_scope.FilterBar;

__ds_ns.RecurrenceForm = __ds_scope.RecurrenceForm;

__ds_ns.SpaceForm = __ds_scope.SpaceForm;

__ds_ns.TagInput = __ds_scope.TagInput;

__ds_ns.TransactionListItem = __ds_scope.TransactionListItem;

__ds_ns.AuthShell = __ds_scope.AuthShell;

__ds_ns.BottomTabBar = __ds_scope.BottomTabBar;

__ds_ns.Header = __ds_scope.Header;

__ds_ns.Layout = __ds_scope.Layout;

__ds_ns.Sidebar = __ds_scope.Sidebar;

__ds_ns.ConfirmDialog = __ds_scope.ConfirmDialog;

__ds_ns.Pagination = __ds_scope.Pagination;

__ds_ns.RenewalDial = __ds_scope.RenewalDial;

})();
