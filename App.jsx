import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Volume2, Delete, Trash2, Smile, UtensilsCrossed, Users, Activity, MapPin,
  HeartPulse, Settings, X, Play, Repeat, Contrast, ScanLine, Type, Sparkles,
  Wind, Gamepad2,
} from "lucide-react";

// ============================================================
// VOCABULARIO
// ============================================================
const CATEGORIES = [
  { id: "necesidades", label: "Necesidades", icon: HeartPulse, color: "#2D6A6A", soft: "#E4F1EF",
    words: [
      { t: "Quiero", e: "👉" }, { t: "Necesito", e: "🙏" }, { t: "Ayuda", e: "🆘" }, { t: "Baño", e: "🚻" },
      { t: "Agua", e: "💧" }, { t: "Dolor", e: "😣" }, { t: "Descansar", e: "🛏️" }, { t: "Parar", e: "✋" },
    ] },
  { id: "sentimientos", label: "Sentimientos", icon: Smile, color: "#B5552E", soft: "#F6E8E1",
    words: [
      { t: "Feliz", e: "😀" }, { t: "Triste", e: "😢" }, { t: "Enojado", e: "😠" }, { t: "Asustado", e: "😨" },
      { t: "Cansado", e: "🥱" }, { t: "Tranquilo", e: "😌" }, { t: "Confundido", e: "😕" }, { t: "Emocionado", e: "🤩" },
    ] },
  { id: "personas", label: "Personas", icon: Users, color: "#3A5A8C", soft: "#E6EBF4",
    words: [
      { t: "Yo", e: "🙋" }, { t: "Tú", e: "🫵" }, { t: "Mamá", e: "👩" }, { t: "Papá", e: "👨" },
      { t: "Amigo", e: "🧑‍🤝‍🧑" }, { t: "Doctor", e: "🩺" }, { t: "Maestro", e: "🍎" }, { t: "Familia", e: "👪" },
    ] },
  { id: "comida", label: "Comida", icon: UtensilsCrossed, color: "#8A6A1E", soft: "#F4EDDB",
    words: [
      { t: "Comer", e: "🍽️" }, { t: "Beber", e: "🥤" }, { t: "Pan", e: "🍞" }, { t: "Fruta", e: "🍎" },
      { t: "Más", e: "➕" }, { t: "Suficiente", e: "🛑" }, { t: "Rico", e: "😋" }, { t: "Caliente", e: "🔥" },
    ] },
  { id: "acciones", label: "Acciones", icon: Activity, color: "#5B4B8A", soft: "#ECE8F4",
    words: [
      { t: "Ir", e: "🚶" }, { t: "Jugar", e: "🧸" }, { t: "Dormir", e: "😴" }, { t: "Leer", e: "📖" },
      { t: "Ver", e: "👀" }, { t: "Escuchar", e: "👂" }, { t: "Abrir", e: "🔓" }, { t: "Cerrar", e: "🔒" },
    ] },
  { id: "lugares", label: "Lugares", icon: MapPin, color: "#2E6E4E", soft: "#E4F0E9",
    words: [
      { t: "Casa", e: "🏠" }, { t: "Escuela", e: "🏫" }, { t: "Hospital", e: "🏥" }, { t: "Afuera", e: "🌳" },
      { t: "Cuarto", e: "🛋️" }, { t: "Cocina", e: "🍳" }, { t: "Carro", e: "🚗" }, { t: "Parque", e: "🌲" },
    ] },
];
// Reglas simples de predicción (no es IA, son asociaciones útiles básicas)
const NEXT_WORD_MAP = {
  Quiero: ["Comer", "Beber", "Ir", "Jugar", "Dormir", "Ayuda"],
  Necesito: ["Ayuda", "Baño", "Agua", "Descansar", "Dolor"],
  Yo: ["Quiero", "Necesito"],
  Mamá: ["Quiero", "Necesito", "Ayuda"],
  Papá: ["Quiero", "Necesito", "Ayuda"],
  Ayuda: ["Mamá", "Papá", "Doctor"],
  Dolor: ["Doctor", "Ayuda"],
  Ir: ["Casa", "Escuela", "Hospital", "Afuera", "Parque", "Baño"],
  Comer: ["Pan", "Fruta", "Más", "Rico", "Caliente"],
  Beber: ["Agua", "Más", "Suficiente"],
  Jugar: ["Afuera", "Parque", "Casa", "Amigo"],
  Dormir: ["Cuarto", "Casa", "Cansado"],
};
const DEFAULT_STARTERS = ["Quiero", "Necesito", "Yo", "Ayuda", "Mamá", "Más"];

const LANG_NAMES = {
  "es-ES": "Español (España)", "es-MX": "Español (México)", "es-US": "Español (EE.UU.)",
  "es-419": "Español (Latinoamérica)", "es-AR": "Español (Argentina)", "es-CO": "Español (Colombia)",
  "en-US": "Inglés (EE.UU.)", "en-GB": "Inglés (Reino Unido)", "pt-BR": "Portugués (Brasil)",
  "fr-FR": "Francés", "de-DE": "Alemán", "it-IT": "Italiano",
};

const SIZES = {
  sm: { grid: 110, font: 14, emoji: 26, pad: "12px 6px", tab: 14 },
  md: { grid: 140, font: 17, emoji: 36, pad: "18px 8px", tab: 16 },
  lg: { grid: 175, font: 20, emoji: 46, pad: "22px 10px", tab: 18 },
  xl: { grid: 215, font: 24, emoji: 56, pad: "26px 12px", tab: 21 },
};

const SCAN_SPEEDS = { lenta: 2200, media: 1400, rapida: 850 };

const THEME_PALETTE = [
  { color: "#2D6A6A", soft: "#E4F1EF" },
  { color: "#B5552E", soft: "#F6E8E1" },
  { color: "#3A5A8C", soft: "#E6EBF4" },
  { color: "#8A6A1E", soft: "#F4EDDB" },
  { color: "#5B4B8A", soft: "#ECE8F4" },
  { color: "#2E6E4E", soft: "#E4F0E9" },
  { color: "#9C2B5B", soft: "#F6E1EC" },
  { color: "#1F6F8B", soft: "#E1EEF1" },
];

const slugify = (text) => {
  const base = text.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `cust-${base || "categoria"}-${Math.random().toString(36).slice(2, 7)}`;
};

const FEMALE_KEYS = ["female", "mujer", "helena", "sabina", "paulina", "monica", "mónica", "laura", "elena",
  "lucia", "lucía", "isabel", "sara", "victoria", "samantha", "susan", "karen", "zira", "salli", "joanna",
  "kendra", "kimberly", "amelie", "ines", "marisol"];
const MALE_KEYS = ["male", "hombre", "diego", "jorge", "pablo", "carlos", "miguel", "fernando", "david",
  "alex", "matthew", "justin", "joey", "brian", "jorge", "raul", "raúl", "pedro", "andres", "andrés"];
const CHILD_KEYS = ["child", "kid", "niñ", "nino", "junior", "ivy"];

function classifyVoice(voice) {
  const n = voice.name.toLowerCase();
  if (CHILD_KEYS.some((k) => n.includes(k))) return "Niño/a";
  if (FEMALE_KEYS.some((k) => n.includes(k))) return "Mujer";
  if (MALE_KEYS.some((k) => n.includes(k))) return "Hombre";
  return "Voz";
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function App() {
  // --- ajustes persistentes ---
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [language, setLanguage] = useState("es-ES");
  const [voiceURI, setVoiceURI] = useState("");
  const [rate, setRate] = useState(0.95);
  const [pitch, setPitch] = useState(1.05);
  const [buttonSize, setButtonSize] = useState("md");
  const [highContrast, setHighContrast] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const [scanSpeed, setScanSpeed] = useState("media");
  const [switchInput, setSwitchInput] = useState(false); // switch físico (teclado/gamepad) como disparador
  const [breathInput, setBreathInput] = useState(false); // soplido/sonido por micrófono como disparador
  const [breathSensitivity, setBreathSensitivity] = useState(0.45); // 0 (muy sensible) a 1 (necesita soplido fuerte)
  const [breathStatus, setBreathStatus] = useState("inactivo"); // inactivo | escuchando | sin-permiso
  const [breathLevel, setBreathLevel] = useState(0); // 0..1 nivel de audio en vivo, para el medidor visual

  // --- control por mirada (eye-tracking con cámara o eye-tracker dedicado que mueve el mouse) ---
  const [eyeControl, setEyeControl] = useState(false);
  const [eyeSource, setEyeSource] = useState("camara"); // "camara" (WebGazer) | "cursor" (eye-tracker dedicado / mouse)
  const [confirmMode, setConfirmMode] = useState("dwell"); // "dwell" (tiempo de espera) | "parpadeo" (parpadeo sostenido)
  const [dwellTime, setDwellTime] = useState(900); // ms que hay que mirar fijo para seleccionar (modo dwell)
  const [webgazerStatus, setWebgazerStatus] = useState("apagado"); // apagado | cargando | calibrando | listo | error
  const [calibrationOpen, setCalibrationOpen] = useState(false);
  const [gazePoint, setGazePoint] = useState(null); // {x,y} última posición estimada de la mirada

  // --- confirmación por parpadeo sostenido (FaceMesh / MediaPipe) ---
  const [blinkHoldMs, setBlinkHoldMs] = useState(450); // ms con ojos cerrados para que cuente como intencional
  const [faceMeshStatus, setFaceMeshStatus] = useState("apagado"); // apagado | cargando | listo | error | sin-rostro
  const [blinkProgress, setBlinkProgress] = useState(0); // 0..1 mientras los ojos están cerrados
  const [blinkCalibrationOpen, setBlinkCalibrationOpen] = useState(false);
  const blinkCalibrationOpenRef = useRef(false);
  useEffect(() => { blinkCalibrationOpenRef.current = blinkCalibrationOpen; }, [blinkCalibrationOpen]);

  // --- estado de la app ---
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].id);
  const [sentence, setSentence] = useState([]);
  const [voices, setVoices] = useState([]);
  const [voiceFilter, setVoiceFilter] = useState("Todas");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [freq, setFreq] = useState({});
  const [lastSpoken, setLastSpoken] = useState("");
  const [scanIndex, setScanIndex] = useState(0);
  const [customWords, setCustomWords] = useState({}); // { [categoryId]: [{t,e,isCustom}] }
  const [customLoaded, setCustomLoaded] = useState(false);
  const [addWordOpen, setAddWordOpen] = useState(false);
  const [newWordText, setNewWordText] = useState("");
  const [newWordEmoji, setNewWordEmoji] = useState("⭐");
  const [newWordCat, setNewWordCat] = useState(CATEGORIES[0].id);
  const [customCategories, setCustomCategories] = useState([]); // [{id,label,emoji,color,soft}]
  const [customCatLoaded, setCustomCatLoaded] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("🌟");
  const [newCatThemeIdx, setNewCatThemeIdx] = useState(0);

  // ---- cargar voces del dispositivo ----
  useEffect(() => {
    function loadVoices() {
      setVoices(window.speechSynthesis.getVoices());
    }
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // ---- cargar ajustes guardados ----
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("caa-settings");
        if (res && res.value) {
          const s = JSON.parse(res.value);
          if (s.language) setLanguage(s.language);
          if (s.voiceURI) setVoiceURI(s.voiceURI);
          if (typeof s.rate === "number") setRate(s.rate);
          if (typeof s.pitch === "number") setPitch(s.pitch);
          if (s.buttonSize) setButtonSize(s.buttonSize);
          if (typeof s.highContrast === "boolean") setHighContrast(s.highContrast);
          if (typeof s.scanMode === "boolean") setScanMode(s.scanMode);
          if (s.scanSpeed) setScanSpeed(s.scanSpeed);
          if (typeof s.switchInput === "boolean") setSwitchInput(s.switchInput);
          if (typeof s.breathInput === "boolean") setBreathInput(s.breathInput);
          if (typeof s.breathSensitivity === "number") setBreathSensitivity(s.breathSensitivity);
          if (typeof s.eyeControl === "boolean") setEyeControl(s.eyeControl);
          if (s.eyeSource) setEyeSource(s.eyeSource);
          if (s.confirmMode) setConfirmMode(s.confirmMode);
          if (typeof s.dwellTime === "number") setDwellTime(s.dwellTime);
          if (typeof s.blinkHoldMs === "number") setBlinkHoldMs(s.blinkHoldMs);
        }
      } catch (e) {
        // no hay ajustes guardados todavía, se usan los valores por defecto
      } finally {
        setSettingsLoaded(true);
      }
    })();
    (async () => {
      try {
        const res = await window.storage.get("caa-custom-words");
        if (res && res.value) setCustomWords(JSON.parse(res.value));
      } catch (e) {
        // todavía no hay palabras personalizadas guardadas
      } finally {
        setCustomLoaded(true);
      }
    })();
    (async () => {
      try {
        const res = await window.storage.get("caa-custom-categories");
        if (res && res.value) setCustomCategories(JSON.parse(res.value));
      } catch (e) {
        // todavía no hay categorías personalizadas guardadas
      } finally {
        setCustomCatLoaded(true);
      }
    })();
  }, []);

  // ---- guardar ajustes cuando cambian ----
  useEffect(() => {
    if (!settingsLoaded) return;
    const payload = JSON.stringify({
      language, voiceURI, rate, pitch, buttonSize, highContrast,
      scanMode, scanSpeed, switchInput, breathInput, breathSensitivity,
      eyeControl, eyeSource, confirmMode, dwellTime, blinkHoldMs,
    });
    window.storage.set("caa-settings", payload).catch(() => {});
  }, [settingsLoaded, language, voiceURI, rate, pitch, buttonSize, highContrast,
      scanMode, scanSpeed, switchInput, breathInput, breathSensitivity,
      eyeControl, eyeSource, confirmMode, dwellTime, blinkHoldMs]);

  // ---- guardar palabras personalizadas cuando cambian ----
  useEffect(() => {
    if (!customLoaded) return;
    window.storage.set("caa-custom-words", JSON.stringify(customWords)).catch(() => {});
  }, [customLoaded, customWords]);

  // ---- guardar categorías personalizadas cuando cambian ----
  useEffect(() => {
    if (!customCatLoaded) return;
    window.storage.set("caa-custom-categories", JSON.stringify(customCategories)).catch(() => {});
  }, [customCatLoaded, customCategories]);

  const selectedVoiceObj = useMemo(
    () => voices.find((v) => v.voiceURI === voiceURI) || null,
    [voices, voiceURI]
  );

  const speakText = useCallback((text, opts) => {
    if (!("speechSynthesis" in window) || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = (opts && opts.lang) || language;
    utter.rate = (opts && opts.rate) ?? rate;
    utter.pitch = (opts && opts.pitch) ?? pitch;
    const v = (opts && opts.voice) ?? selectedVoiceObj;
    if (v) utter.voice = v;
    window.speechSynthesis.speak(utter);
    setLastSpoken(text);
  }, [language, rate, pitch, selectedVoiceObj]);

  const sizes = SIZES[buttonSize];
  const allCategories = useMemo(() => [...CATEGORIES, ...customCategories], [customCategories]);
  const category = allCategories.find((c) => c.id === activeCat) || allCategories[0];

  // ---- palabras combinadas: predefinidas + personalizadas ----
  const wordsForCategory = useCallback((catId) => {
    const base = CATEGORIES.find((c) => c.id === catId)?.words || [];
    const extra = customWords[catId] || [];
    return [...base, ...extra];
  }, [customWords]);

  const categoryWords = wordsForCategory(activeCat);

  const findAnyWord = useCallback((t) => {
    for (const c of allCategories) {
      const found = wordsForCategory(c.id).find((w) => w.t === t);
      if (found) return found;
    }
    return null;
  }, [wordsForCategory, allCategories]);

  const addCustomWord = () => {
    const text = newWordText.trim();
    if (!text) return;
    const word = { t: text, e: newWordEmoji || "⭐", isCustom: true };
    setCustomWords((cw) => ({ ...cw, [newWordCat]: [...(cw[newWordCat] || []), word] }));
    setNewWordText("");
    setNewWordEmoji("⭐");
    setAddWordOpen(false);
    setActiveCat(newWordCat);
  };

  const removeCustomWord = (catId, text) => {
    setCustomWords((cw) => ({ ...cw, [catId]: (cw[catId] || []).filter((w) => w.t !== text) }));
  };

  const addCustomCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    const theme = THEME_PALETTE[newCatThemeIdx];
    const id = slugify(name);
    const newCat = { id, label: name, emoji: newCatEmoji || "🌟", color: theme.color, soft: theme.soft, words: [] };
    setCustomCategories((cats) => [...cats, newCat]);
    setNewCatName("");
    setNewCatEmoji("🌟");
    setNewCatThemeIdx(0);
    setAddCategoryOpen(false);
    setActiveCat(id);
  };

  const removeCustomCategory = (catId) => {
    setCustomCategories((cats) => cats.filter((c) => c.id !== catId));
    setCustomWords((cw) => {
      const next = { ...cw };
      delete next[catId];
      return next;
    });
    if (activeCat === catId) setActiveCat(CATEGORIES[0].id);
  };

  // ---- predicción de siguiente palabra ----
  const predictions = useMemo(() => {
    const last = sentence[sentence.length - 1];
    let list = [];
    if (last && NEXT_WORD_MAP[last.t]) {
      list = NEXT_WORD_MAP[last.t];
    } else {
      const sortedByFreq = Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([t]) => t);
      list = sortedByFreq.length ? sortedByFreq : DEFAULT_STARTERS;
    }
    return list.map(findAnyWord).filter(Boolean).slice(0, 6);
  }, [sentence, freq, findAnyWord]);

  const addWord = useCallback((word) => {
    setSentence((s) => [...s, word]);
    setFreq((f) => ({ ...f, [word.t]: (f[word.t] || 0) + 1 }));
    speakText(word.t);
  }, [speakText]);

  const removeLast = () => setSentence((s) => s.slice(0, -1));
  const clearAll = () => setSentence([]);
  const speakSentence = () => {
    if (sentence.length === 0) return;
    speakText(sentence.map((w) => w.t).join(" "));
  };
  const repeatLast = () => { if (lastSpoken) speakText(lastSpoken); };

  // ============================================================
  // MODO ESCANEO (acceso por interruptor único)
  // ============================================================
  const scanItems = useMemo(() => {
    const items = [];
    predictions.forEach((w) => items.push({ type: "word", word: w, label: w.t }));
    categoryWords.forEach((w) => items.push({ type: "word", word: w, label: w.t }));
    allCategories.forEach((c) => items.push({ type: "cat", id: c.id, label: c.label }));
    items.push({ type: "control", id: "hablar", label: "Hablar la frase" });
    items.push({ type: "control", id: "repetir", label: "Repetir lo último" });
    items.push({ type: "control", id: "borrarUltima", label: "Borrar última palabra" });
    items.push({ type: "control", id: "borrarTodo", label: "Borrar toda la frase" });
    return items;
  }, [predictions, categoryWords, allCategories]);

  useEffect(() => { setScanIndex(0); }, [activeCat, scanMode]);

  useEffect(() => {
    if (!scanMode || scanItems.length === 0) return;
    const ms = SCAN_SPEEDS[scanSpeed];
    const id = setInterval(() => {
      setScanIndex((i) => (i + 1) % scanItems.length);
    }, ms);
    return () => clearInterval(id);
  }, [scanMode, scanSpeed, scanItems.length]);

  const activateScanItem = useCallback((item) => {
    if (!item) return;
    if (item.type === "word") addWord(item.word);
    else if (item.type === "cat") setActiveCat(item.id);
    else if (item.type === "control") {
      if (item.id === "hablar") speakSentence();
      else if (item.id === "repetir") repeatLast();
      else if (item.id === "borrarUltima") removeLast();
      else if (item.id === "borrarTodo") clearAll();
    }
  }, [addWord, sentence, lastSpoken]);

  // ---- disparador único: se llama cada vez que el switch se activa, sin importar el origen ----
  const triggerSwitch = useCallback(() => {
    activateScanItem(scanItems[scanIndex]);
  }, [activateScanItem, scanItems, scanIndex]);

  // ---- Switch físico: teclado (Espacio/Enter) — funciona con casi cualquier switch USB ----
  useEffect(() => {
    if (!switchInput) return;
    function onKey(e) {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        triggerSwitch();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [switchInput, triggerSwitch]);

  // ---- Switch físico: gamepad/joystick Bluetooth (muchos switches AAC se reconocen así) ----
  useEffect(() => {
    if (!switchInput) return;
    let raf;
    let wasPressed = false;
    function pollGamepad() {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      let anyPressed = false;
      for (const pad of pads) {
        if (!pad) continue;
        if (pad.buttons.some((b) => b.pressed || b.value > 0.5)) { anyPressed = true; break; }
      }
      if (anyPressed && !wasPressed) triggerSwitch(); // solo al presionar, no al mantener
      wasPressed = anyPressed;
      raf = requestAnimationFrame(pollGamepad);
    }
    raf = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(raf);
  }, [switchInput, triggerSwitch]);

  // ============================================================
  // CONTROL POR MIRADA (eye-tracking con cámara, o eye-tracker dedicado / mouse)
  // ============================================================
  const dwellTimerRef = useRef(null);
  const gazeTargetRef = useRef(null); // elemento accionable actualmente bajo la mirada (dwell o parpadeo)
  const [dwellProgress, setDwellProgress] = useState(0); // 0..1 para el anillo de "llenado" (modo dwell)
  const [gazeTargetRect, setGazeTargetRect] = useState(null);

  // ---- resuelve la acción correspondiente a un elemento marcado con data-gaze-action ----
  const runGazeAction = useCallback((el) => {
    const action = el.getAttribute("data-gaze-action");
    if (!action) return;
    if (action === "word") {
      const idx = Number(el.getAttribute("data-gaze-word-idx"));
      const word = categoryWords[idx];
      if (word) addWord(word);
    } else if (action === "pred") {
      const idx = Number(el.getAttribute("data-gaze-pred-idx"));
      const word = predictions[idx];
      if (word) addWord(word);
    } else if (action === "cat") setActiveCat(el.getAttribute("data-gaze-cat-id"));
    else if (action === "hablar") speakSentence();
    else if (action === "repetir") repeatLast();
    else if (action === "borrarUltima") removeLast();
    else if (action === "borrarTodo") clearAll();
    else if (action === "ajustes") setSettingsOpen(true);
  }, [categoryWords, predictions, addWord]);

  // ---- procesa una posición de pantalla (de mouse o de WebGazer) contra los elementos accionables ----
  // En modo "dwell" además inicia el temporizador de selección por tiempo de espera.
  // En modo "parpadeo" solo actualiza cuál es el elemento señalado; lo confirma el detector de parpadeo.
  const processGazePoint = useCallback((x, y) => {
    if (calibrationOpen || blinkCalibrationOpen) return; // durante calibraciones, los clics son manuales
    setGazePoint({ x, y });
    const rawEl = document.elementFromPoint(x, y)?.closest("[data-gaze-action]") || null;
    const el = rawEl && !rawEl.disabled ? rawEl : null;

    if (el !== gazeTargetRef.current) {
      gazeTargetRef.current = el;
      setDwellProgress(0);
      if (dwellTimerRef.current) clearInterval(dwellTimerRef.current);
      setGazeTargetRect(el ? el.getBoundingClientRect() : null);

      if (el && confirmMode === "dwell") {
        const startedAt = performance.now();
        dwellTimerRef.current = setInterval(() => {
          const elapsed = performance.now() - startedAt;
          const pct = Math.min(1, elapsed / dwellTime);
          setDwellProgress(pct);
          if (pct >= 1) {
            clearInterval(dwellTimerRef.current);
            dwellTimerRef.current = null;
            runGazeAction(el);
            gazeTargetRef.current = null;
            setDwellProgress(0);
            setGazeTargetRect(null);
          }
        }, 30);
      }
    }
  }, [dwellTime, runGazeAction, calibrationOpen, blinkCalibrationOpen, confirmMode]);

  // ---- fuente "cursor": mouse real o eye-tracker dedicado que mueve el cursor del sistema ----
  useEffect(() => {
    if (!eyeControl || eyeSource !== "cursor") return;
    function onMove(e) { processGazePoint(e.clientX, e.clientY); }
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (dwellTimerRef.current) clearInterval(dwellTimerRef.current);
      gazeTargetRef.current = null;
      setDwellProgress(0);
      setGazeTargetRect(null);
      setGazePoint(null);
    };
  }, [eyeControl, eyeSource, processGazePoint]);

  // ---- fuente "camara": WebGazer.js estimando el punto de mirada desde la webcam ----
  useEffect(() => {
    if (!eyeControl || eyeSource !== "camara") return;
    let cancelled = false;

    function ensureScriptLoaded() {
      return new Promise((resolve, reject) => {
        if (window.webgazer) return resolve();
        const existing = document.querySelector('script[data-webgazer="1"]');
        if (existing) {
          existing.addEventListener("load", resolve);
          existing.addEventListener("error", reject);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/webgazer/3.3.1/webgazer.min.js";
        script.dataset.webgazer = "1";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    setWebgazerStatus("cargando");
    ensureScriptLoaded()
      .then(async () => {
        if (cancelled || !window.webgazer) return;
        window.webgazer
          .setRegression("ridge")
          .setGazeListener((data) => {
            if (data) processGazePoint(data.x, data.y);
          })
          .saveDataAcrossSessions(true);
        await window.webgazer.begin();
        if (cancelled) return;
        // ocultamos los widgets propios de WebGazer (video y puntos), usamos nuestro propio puntero
        window.webgazer.showVideo(false).showFaceOverlay(false).showFaceFeedbackBox(false).showPredictionPoints(false);
        setWebgazerStatus("listo");
      })
      .catch(() => { if (!cancelled) setWebgazerStatus("error"); });

    return () => {
      cancelled = true;
      if (window.webgazer) {
        try { window.webgazer.end(); } catch (e) { /* ya estaba detenido */ }
      }
      setWebgazerStatus("apagado");
      if (dwellTimerRef.current) clearInterval(dwellTimerRef.current);
      gazeTargetRef.current = null;
      setDwellProgress(0);
      setGazeTargetRect(null);
      setGazePoint(null);
    };
  }, [eyeControl, eyeSource, processGazePoint]);

  // ---- Confirmación por parpadeo sostenido: detecta cuánto tiempo llevan los ojos cerrados ----
  // Usa MediaPipe FaceLandmarker para ubicar los puntos del párpado y calcular el EAR (Eye Aspect Ratio).
  useEffect(() => {
    if (!eyeControl || confirmMode !== "parpadeo") {
      setFaceMeshStatus("apagado");
      return;
    }
    let cancelled = false;
    let videoEl, stream, landmarker, raf;
    let closedSince = null;
    let firedForThisBlink = false;

    // índices de FaceMesh para los puntos verticales/horizontales de cada ojo (estándar de 468 puntos)
    const LEFT_EYE = { top: 159, bottom: 145, left: 33, right: 133 };
    const RIGHT_EYE = { top: 386, bottom: 374, left: 362, right: 263 };

    function eyeAspectRatio(landmarks, eye) {
      const top = landmarks[eye.top], bottom = landmarks[eye.bottom];
      const left = landmarks[eye.left], right = landmarks[eye.right];
      const vertical = Math.hypot(top.x - bottom.x, top.y - bottom.y);
      const horizontal = Math.hypot(left.x - right.x, left.y - right.y);
      return horizontal === 0 ? 0 : vertical / horizontal;
    }

    function loadScript(flag) {
      return new Promise((resolve, reject) => {
        if (window[flag]) return resolve();
        const existing = document.querySelector(`script[data-${flag}="1"]`);
        if (existing) { existing.addEventListener("load", resolve); existing.addEventListener("error", reject); return; }
        const script = document.createElement("script");
        script.type = "module";
        script.dataset[flag] = "1";
        script.textContent = `
          import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";
          window.__FaceLandmarker = FaceLandmarker;
          window.__FilesetResolver = FilesetResolver;
          window.${flag} = true;
          document.dispatchEvent(new Event("${flag}-ready"));
        `;
        document.head.appendChild(script);
        document.addEventListener(`${flag}-ready`, resolve, { once: true });
        script.onerror = reject;
      });
    }

    async function start() {
      setFaceMeshStatus("cargando");
      try {
        await loadScript("mediapipeReady");
        if (cancelled) return;
        const resolver = await window.__FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        landmarker = await window.__FaceLandmarker.createFromOptions(resolver, {
          baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task" },
          runningMode: "VIDEO", numFaces: 1,
        });
        if (cancelled) return;

        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        videoEl = document.createElement("video");
        videoEl.srcObject = stream;
        videoEl.muted = true;
        await videoEl.play();
        setFaceMeshStatus("listo");

        function tick() {
          if (cancelled) return;
          const now = performance.now();
          const result = landmarker.detectForVideo(videoEl, now);
          if (result.faceLandmarks && result.faceLandmarks.length > 0) {
            const lm = result.faceLandmarks[0];
            const ear = (eyeAspectRatio(lm, LEFT_EYE) + eyeAspectRatio(lm, RIGHT_EYE)) / 2;
            const closed = ear < 0.16; // umbral típico de EAR para "ojo cerrado"

            if (closed) {
              if (closedSince === null) { closedSince = now; firedForThisBlink = false; }
              const heldMs = now - closedSince;
              setBlinkProgress(Math.min(1, heldMs / blinkHoldMs));
              if (heldMs >= blinkHoldMs && !firedForThisBlink) {
                firedForThisBlink = true;
                if (!blinkCalibrationOpenRef.current) {
                  const el = gazeTargetRef.current;
                  if (el) runGazeAction(el);
                }
              }
            } else {
              closedSince = null;
              firedForThisBlink = false;
              setBlinkProgress(0);
            }
          } else {
            setFaceMeshStatus("sin-rostro");
          }
          raf = requestAnimationFrame(tick);
        }
        raf = requestAnimationFrame(tick);
      } catch (err) {
        if (!cancelled) setFaceMeshStatus("error");
      }
    }
    start();

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (landmarker) { try { landmarker.close(); } catch (e) { /* ya cerrado */ } }
      setFaceMeshStatus("apagado");
      setBlinkProgress(0);
    };
  }, [eyeControl, confirmMode, blinkHoldMs, runGazeAction]);



  useEffect(() => {
    if (!breathInput) { setBreathStatus("inactivo"); return; }
    let audioCtx, analyser, source, stream, raf;
    let cooling = false; // evita que un soplido largo dispare varias selecciones de golpe
    const COOLDOWN_MS = 900;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        setBreathStatus("escuchando");

        function tick() {
          analyser.getByteTimeDomainData(data);
          // calculamos energía de la señal (RMS) para detectar el soplido/sonido
          let sumSquares = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sumSquares += v * v;
          }
          const rms = Math.sqrt(sumSquares / data.length); // 0..~1
          setBreathLevel(Math.min(1, rms * 4));
          const threshold = 0.06 + breathSensitivity * 0.5; // umbral según sensibilidad elegida
          if (rms > threshold && !cooling) {
            cooling = true;
            triggerSwitch();
            setTimeout(() => { cooling = false; }, COOLDOWN_MS);
          }
          raf = requestAnimationFrame(tick);
        }
        tick();
      } catch (err) {
        setBreathStatus("sin-permiso");
      }
    }
    start();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (source) source.disconnect();
      if (audioCtx) audioCtx.close();
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setBreathStatus("inactivo");
      setBreathLevel(0);
    };
  }, [breathInput, breathSensitivity, triggerSwitch]);

  // ============================================================
  // TEMA / COLORES
  // ============================================================
  const theme = highContrast
    ? { bg: "#000000", panel: "#000000", barBg: "#111111", text: "#FFFFFF", sub: "#CFCFCF",
        cardBorder: "#FFFFFF", accent: "#FFD60A", danger: "#FF5252" }
    : { bg: "#FAF8F4", panel: "#FFFFFF", barBg: "#1E2326", text: "#1E2326", sub: "#9A958C",
        cardBorder: "transparent", accent: "#C24E2A", danger: "#3A3530" };

  const isScanCurrent = (predicate) => {
    if (!scanMode) return false;
    const item = scanItems[scanIndex];
    return item && predicate(item);
  };

  const scanRing = (active) => active ? { boxShadow: `0 0 0 4px ${theme.accent}`, transform: "scale(1.04)" } : {};

  const langOptions = useMemo(() => {
    const uniqueLangs = Array.from(new Set(voices.map((v) => v.lang)));
    if (uniqueLangs.length === 0) return [language];
    return uniqueLangs.sort();
  }, [voices, language]);

  const voicesForLang = voices.filter((v) => v.lang === language);
  const visibleVoices = voiceFilter === "Todas" ? voicesForLang : voicesForLang.filter((v) => classifyVoice(v) === voiceFilter);

  return (
    <div style={{
      fontFamily: "'Atkinson Hyperlegible','Segoe UI',system-ui,sans-serif",
      background: theme.bg, minHeight: "100vh", display: "flex", flexDirection: "column", color: theme.text,
    }}>
      {/* Barra superior: frase + ajustes -------------------------------- */}
      <div style={{ padding: "16px 18px", background: theme.barBg, display: "flex", gap: 12, alignItems: "stretch" }}>
        <div role="region" aria-label="Frase construida" style={{
          flex: 1, background: theme.panel, borderRadius: 18, padding: "14px 18px",
          display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", minHeight: 60,
          border: highContrast ? "2px solid #fff" : "none",
        }}>
          {sentence.length === 0 && (
            <span style={{ color: theme.sub, fontSize: 17 }}>Toca las palabras para armar tu frase…</span>
          )}
          {sentence.map((w, i) => (
            <span key={i} style={{
              fontSize: 19, fontWeight: 700, background: highContrast ? "#222" : "#EFEAE0",
              color: theme.text, borderRadius: 12, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 21 }}>{w.e}</span>{w.t}
            </span>
          ))}
        </div>
        <button onClick={removeLast} data-gaze-action="borrarUltima" aria-label="Borrar última palabra" disabled={sentence.length === 0}
          style={iconBtnStyle(theme.danger, sentence.length === 0)}><Delete size={26} /></button>
        <button onClick={clearAll} data-gaze-action="borrarTodo" aria-label="Borrar toda la frase" disabled={sentence.length === 0}
          style={iconBtnStyle(theme.danger, sentence.length === 0)}><Trash2 size={26} /></button>
        <button onClick={() => setSettingsOpen(true)} data-gaze-action="ajustes" aria-label="Abrir ajustes"
          style={iconBtnStyle(highContrast ? "#444" : "#5A554C", false)}><Settings size={26} /></button>
      </div>

      {/* Botón hablar + repetir ------------------------------------------ */}
      <div style={{ padding: "14px 18px 4px", display: "flex", gap: 12 }}>
        <button onClick={speakSentence} data-gaze-action="hablar" disabled={sentence.length === 0}
          style={{
            ...scanRing(isScanCurrent((it) => it.type === "control" && it.id === "hablar")),
            flex: 1, background: sentence.length === 0 ? "#CFC9BC" : theme.accent, color: highContrast ? "#000" : "#fff",
            border: "none", borderRadius: 20, padding: "20px 0", fontSize: 25, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            cursor: sentence.length === 0 ? "default" : "pointer",
          }}>
          <Volume2 size={28} /> HABLAR
        </button>
        <button onClick={repeatLast} data-gaze-action="repetir" disabled={!lastSpoken} aria-label="Repetir lo último dicho"
          style={{
            ...scanRing(isScanCurrent((it) => it.type === "control" && it.id === "repetir")),
            width: 84, background: !lastSpoken ? "#CFC9BC" : (highContrast ? "#333" : "#EFEAE0"),
            color: !lastSpoken ? "#888" : theme.text, border: highContrast ? "2px solid #fff" : "none",
            borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 2, cursor: !lastSpoken ? "default" : "pointer",
          }}>
          <Repeat size={24} /><span style={{ fontSize: 11, fontWeight: 700 }}>Repetir</span>
        </button>
      </div>

      {/* Sugerencias / predicción ----------------------------------------- */}
      {predictions.length > 0 && (
        <div style={{ padding: "10px 18px 0", display: "flex", gap: 8, overflowX: "auto" }}>
          {predictions.map((w, predIdx) => {
            const active = isScanCurrent((it) => it.type === "word" && it.label === w.t && predictions.includes(it.word));
            return (
              <button key={"pred-" + w.t} onClick={() => addWord(w)}
                data-gaze-action="pred" data-gaze-pred-idx={predIdx}
                style={{
                  ...scanRing(active),
                  flex: "0 0 auto", display: "flex", alignItems: "center", gap: 6, padding: "8px 12px",
                  borderRadius: 999, background: highContrast ? "#222" : "#FFF3E9",
                  border: highContrast ? "1px solid #fff" : `1px solid ${theme.accent}55`,
                  color: theme.text, fontSize: 14, fontWeight: 700, cursor: "pointer",
                }}>
                <span style={{ fontSize: 17 }}>{w.e}</span>{w.t}
              </button>
            );
          })}
        </div>
      )}

      {/* Pestañas de categoría --------------------------------------------- */}
      <nav aria-label="Categorías de palabras" style={{ display: "flex", gap: 10, padding: "14px 18px 4px", overflowX: "auto" }}>
        {allCategories.map((c) => {
          const Icon = c.icon;
          const active = c.id === activeCat;
          const scanActive = isScanCurrent((it) => it.type === "cat" && it.id === c.id);
          return (
            <button key={c.id} onClick={() => setActiveCat(c.id)} data-gaze-action="cat" data-gaze-cat-id={c.id} aria-pressed={active}
              style={{
                ...scanRing(scanActive),
                position: "relative",
                flex: "0 0 auto", display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
                borderRadius: 14, border: active ? `2px solid ${c.color}` : (highContrast ? "2px solid #555" : "2px solid transparent"),
                background: active ? c.color : (highContrast ? "#161616" : c.soft),
                color: active ? "#fff" : theme.text, fontSize: sizes.tab, fontWeight: 700, cursor: "pointer",
              }}>
              {Icon ? <Icon size={20} /> : <span style={{ fontSize: 18 }}>{c.emoji}</span>}
              {c.label}
              {!c.icon && (
                <span role="button" tabIndex={0} aria-label={`Eliminar categoría ${c.label}`}
                  onClick={(e) => { e.stopPropagation(); removeCustomCategory(c.id); }}
                  style={{
                    width: 18, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.3)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, marginLeft: 2,
                  }}>✕</span>
              )}
            </button>
          );
        })}
        <button onClick={() => setAddCategoryOpen(true)} aria-label="Crear categoría nueva"
          style={{
            flex: "0 0 auto", display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
            borderRadius: 14, border: `2px dashed ${highContrast ? "#fff" : "#9A958C"}`,
            background: highContrast ? "#111" : "#fff", color: theme.text, fontSize: sizes.tab, fontWeight: 700, cursor: "pointer",
          }}>
          ➕ Nuevo módulo
        </button>
      </nav>

      {/* Cuadrícula de palabras --------------------------------------------- */}
      <main style={{
        flex: 1, padding: "10px 18px 20px", display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(${sizes.grid}px, 1fr))`, gap: 14, alignContent: "start",
      }}>
        {categoryWords.map((w, wordIdx) => {
          const scanActive = isScanCurrent((it) => it.type === "word" && it.word === w);
          return (
            <button key={w.t} onClick={() => addWord(w)} data-gaze-action="word" data-gaze-word-idx={wordIdx}
              style={{
                ...scanRing(scanActive),
                position: "relative",
                background: highContrast ? category.color : category.soft,
                color: highContrast ? "#fff" : "#1E2326",
                border: highContrast ? "2px solid #fff" : `2px solid ${category.color}22`,
                borderRadius: 18, padding: sizes.pad, display: "flex", flexDirection: "column",
                alignItems: "center", gap: 8, cursor: "pointer", minHeight: sizes.grid * 0.78,
              }}>
              {w.isCustom && (
                <span role="button" tabIndex={0} aria-label={`Eliminar palabra ${w.t}`}
                  onClick={(e) => { e.stopPropagation(); removeCustomWord(activeCat, w.t); }}
                  style={{
                    position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%",
                    background: "rgba(0,0,0,0.35)", color: "#fff", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 13, fontWeight: 800, lineHeight: 1,
                  }}>✕</span>
              )}
              <span style={{ fontSize: sizes.emoji, lineHeight: 1 }}>{w.e}</span>
              <span style={{ fontSize: sizes.font, fontWeight: 700, textAlign: "center" }}>{w.t}</span>
            </button>
          );
        })}

        <button onClick={() => { setNewWordCat(activeCat); setAddWordOpen(true); }}
          aria-label="Agregar palabra nueva"
          style={{
            background: highContrast ? "#111" : "#fff",
            color: highContrast ? "#fff" : category.color,
            border: `2px dashed ${highContrast ? "#fff" : category.color}`,
            borderRadius: 18, padding: sizes.pad, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", minHeight: sizes.grid * 0.78,
          }}>
          <span style={{ fontSize: sizes.emoji, lineHeight: 1 }}>➕</span>
          <span style={{ fontSize: sizes.font, fontWeight: 700, textAlign: "center" }}>Agregar palabra</span>
        </button>
      </main>

      {/* Pie de modo escaneo y disparadores ----------------------------------- */}
      {scanMode && (
        <div style={{ padding: "0 18px 16px" }}>
          <button onClick={triggerSwitch}
            style={{
              width: "100%", background: theme.accent, color: highContrast ? "#000" : "#fff", border: "none",
              borderRadius: 18, padding: "16px 0", fontSize: 18, fontWeight: 800, cursor: "pointer",
            }}>
            SELECCIONAR ({scanItems[scanIndex]?.label})
          </button>
          <p style={{ textAlign: "center", color: theme.sub, fontSize: 13, margin: "8px 0 0" }}>
            {[
              switchInput && "presiona el switch",
              breathInput && "sopla o haz un sonido",
              "o toca este botón",
            ].filter(Boolean).join(" · ")}
          </p>
          {breathInput && (
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: theme.sub, flexShrink: 0 }}>
                {breathStatus === "escuchando" ? "🎤 Escuchando" : breathStatus === "sin-permiso" ? "⚠️ Sin acceso al micrófono" : "Micrófono"}
              </span>
              <div style={{ flex: 1, height: 10, borderRadius: 6, background: highContrast ? "#222" : "#EFEAE0", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 6, background: theme.accent,
                  width: `${Math.round(breathLevel * 100)}%`, transition: "width 0.08s linear",
                }} />
              </div>
            </div>
          )}
        </div>
      )}

      <p style={{ textAlign: "center", color: theme.sub, fontSize: 13, padding: "0 18px 16px" }}>
        Toca una palabra para escucharla. Arma una frase y presiona HABLAR para decirla completa.
      </p>

      {/* ====================== PANEL DE AJUSTES ====================== */}
      {settingsOpen && (
        <div role="dialog" aria-label="Ajustes" style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex",
          alignItems: "flex-end", justifyContent: "center", zIndex: 50,
        }} onClick={() => setSettingsOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: highContrast ? "#0A0A0A" : "#fff", color: theme.text, width: "100%", maxWidth: 560,
            maxHeight: "88vh", overflowY: "auto", borderRadius: "22px 22px 0 0", padding: 22,
            border: highContrast ? "2px solid #fff" : "none",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>Ajustes</h2>
              <button onClick={() => setSettingsOpen(false)} aria-label="Cerrar ajustes" style={iconBtnStyle("#5A554C", false)}>
                <X size={22} />
              </button>
            </div>

            {/* Idioma */}
            <SectionTitle icon={Type} text="Idioma de la voz" />
            <select value={language} onChange={(e) => { setLanguage(e.target.value); setVoiceURI(""); }}
              style={selectStyle(highContrast)}>
              {langOptions.map((l) => <option key={l} value={l}>{LANG_NAMES[l] || l}</option>)}
            </select>

            {/* Voz */}
            <SectionTitle icon={Volume2} text="Voz" sub="Elige una voz y presiona ▶ para escucharla antes de elegir" />
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              {["Todas", "Mujer", "Hombre", "Niño/a"].map((f) => (
                <button key={f} onClick={() => setVoiceFilter(f)} style={chipStyle(voiceFilter === f, highContrast)}>{f}</button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {visibleVoices.length === 0 && (
                <p style={{ color: theme.sub, fontSize: 14 }}>
                  No se encontraron voces de este tipo para el idioma elegido en tu dispositivo. Prueba "Todas" o cambia el idioma.
                </p>
              )}
              {visibleVoices.map((v) => (
                <div key={v.voiceURI} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12,
                  background: voiceURI === v.voiceURI ? (highContrast ? "#222" : "#FFF3E9") : "transparent",
                  border: voiceURI === v.voiceURI ? `2px solid ${theme.accent}` : (highContrast ? "1px solid #444" : "1px solid #eee"),
                }}>
                  <button onClick={() => speakText("Hola, así sueno yo", { voice: v, lang: v.lang })}
                    aria-label={`Escuchar muestra de ${v.name}`} style={iconBtnStyle("#5A554C", false)}>
                    <Play size={18} />
                  </button>
                  <button onClick={() => setVoiceURI(v.voiceURI)} style={{
                    flex: 1, textAlign: "left", background: "none", border: "none", color: theme.text,
                    fontSize: 15, fontWeight: 600, cursor: "pointer",
                  }}>
                    {v.name} <span style={{ color: theme.sub, fontWeight: 400 }}>· {classifyVoice(v)}</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Velocidad y tono */}
            <SectionTitle icon={Volume2} text="Hacer la voz más agradable" />
            <label style={labelStyle}>Velocidad: {rate.toFixed(2)}</label>
            <input type="range" min="0.5" max="1.5" step="0.05" value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))} style={{ width: "100%", marginBottom: 12 }} />
            <label style={labelStyle}>Tono: {pitch.toFixed(2)}</label>
            <input type="range" min="0.5" max="1.8" step="0.05" value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))} style={{ width: "100%", marginBottom: 16 }} />

            {/* Tamaño de botón */}
            <SectionTitle icon={Type} text="Tamaño de los botones" />
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {[["sm", "Pequeño"], ["md", "Mediano"], ["lg", "Grande"], ["xl", "Muy grande"]].map(([k, label]) => (
                <button key={k} onClick={() => setButtonSize(k)} style={chipStyle(buttonSize === k, highContrast)}>{label}</button>
              ))}
            </div>

            {/* Alto contraste */}
            <SectionTitle icon={Contrast} text="Alto contraste (baja visión)" />
            <ToggleRow checked={highContrast} onChange={setHighContrast} label="Activar alto contraste" highContrast={highContrast} accent={theme.accent} />

            {/* Modo escaneo */}
            <SectionTitle icon={ScanLine} text="Modo escaneo (1 solo botón / interruptor)" sub="Resalta automáticamente cada opción, una por una. Se elige con cualquiera de los disparadores de abajo." />
            <ToggleRow checked={scanMode} onChange={setScanMode} label="Activar modo escaneo" highContrast={highContrast} accent={theme.accent} />
            {scanMode && (
              <div style={{ display: "flex", gap: 8, marginTop: 10, marginBottom: 10, flexWrap: "wrap" }}>
                {[["lenta", "Lenta"], ["media", "Media"], ["rapida", "Rápida"]].map(([k, label]) => (
                  <button key={k} onClick={() => setScanSpeed(k)} style={chipStyle(scanSpeed === k, highContrast)}>{label}</button>
                ))}
              </div>
            )}

            {/* Switch físico */}
            <SectionTitle icon={Gamepad2} text="Switch físico (sin usar los dedos)"
              sub="Funciona con switches USB/Bluetooth que se conectan como teclado (Espacio/Enter) o como gamepad. Cualquier botón del switch activa la selección." />
            <ToggleRow checked={switchInput} onChange={setSwitchInput} label="Activar switch físico" highContrast={highContrast} accent={theme.accent} />
            {switchInput && !scanMode && (
              <p style={{ fontSize: 13, color: theme.accent, marginTop: 8, fontWeight: 600 }}>
                ⚠️ También activa "Modo escaneo" arriba: el switch elige la opción que está resaltada, así que el escaneo debe estar encendido para que tenga efecto.
              </p>
            )}

            {/* Soplido / sonido */}
            <div style={{ marginTop: 16 }}>
              <SectionTitle icon={Wind} text="Soplido o sonido (micrófono)"
                sub="Detecta un soplido, silbido o sonido fuerte cerca del micrófono para activar la selección. El navegador pedirá permiso para usar el micrófono." />
              <ToggleRow checked={breathInput} onChange={setBreathInput} label="Activar soplido/sonido" highContrast={highContrast} accent={theme.accent} />
              {breathInput && !scanMode && (
                <p style={{ fontSize: 13, color: theme.accent, marginTop: 8, fontWeight: 600 }}>
                  ⚠️ También activa "Modo escaneo" arriba: el soplido elige la opción resaltada, así que el escaneo debe estar encendido para que tenga efecto.
                </p>
              )}
              {breathInput && (
                <div style={{ marginTop: 12 }}>
                  <label style={labelStyle}>
                    Sensibilidad: {breathSensitivity < 0.34 ? "alta (cualquier sonido suave)" : breathSensitivity < 0.67 ? "media" : "baja (necesita soplido fuerte)"}
                  </label>
                  <input type="range" min="0.05" max="0.95" step="0.05" value={breathSensitivity}
                    onChange={(e) => setBreathSensitivity(parseFloat(e.target.value))} style={{ width: "100%", marginBottom: 10 }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12,
                    background: highContrast ? "#161616" : "#FAF8F4", border: highContrast ? "1px solid #444" : "1px solid #eee" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: theme.sub, flexShrink: 0 }}>
                      {breathStatus === "escuchando" ? "🎤 Escuchando" : breathStatus === "sin-permiso" ? "⚠️ Permiso denegado" : "Probando…"}
                    </span>
                    <div style={{ flex: 1, height: 10, borderRadius: 6, background: highContrast ? "#222" : "#EFEAE0", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 6, background: theme.accent,
                        width: `${Math.round(breathLevel * 100)}%`, transition: "width 0.08s linear" }} />
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: theme.sub, marginTop: 8 }}>
                    Sopla cerca del micrófono: la barra debe llenarse bastante para que se active. Si se activa solo o con el ruido normal del ambiente, baja la sensibilidad (muévela a la derecha).
                  </p>
                </div>
              )}
            </div>

            {/* Control por mirada */}
            <div style={{ marginTop: 16 }}>
              <SectionTitle icon={Sparkles} text="Control por mirada (sin tocar nada)"
                sub="Mueve un puntero con los ojos y selecciona quedándose mirando fijo una opción, sin necesidad de presionar nada. No usa el modo escaneo." />
              <ToggleRow checked={eyeControl} onChange={setEyeControl} label="Activar control por mirada" highContrast={highContrast} accent={theme.accent} />

              {eyeControl && (
                <div style={{ marginTop: 12 }}>
                  <label style={labelStyle}>¿Cómo se mueve el puntero?</label>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                    <button onClick={() => setEyeSource("cursor")} style={chipStyle(eyeSource === "cursor", highContrast)}>
                      Eye-tracker dedicado / mouse
                    </button>
                    <button onClick={() => setEyeSource("camara")} style={chipStyle(eyeSource === "camara", highContrast)}>
                      Solo cámara web
                    </button>
                  </div>

                  {eyeSource === "cursor" && (
                    <p style={{ fontSize: 13, color: theme.sub, marginBottom: 12 }}>
                      Usa el dispositivo que ya mueve el cursor del sistema (Tobii, EyeGaze u otro). No necesita permisos ni calibración aquí.
                    </p>
                  )}

                  {eyeSource === "camara" && (
                    <>
                      <p style={{ fontSize: 13, color: theme.sub, marginBottom: 10 }}>
                        Usa la cámara del dispositivo para estimar hacia dónde miras. El navegador pedirá permiso de cámara.
                        {" "}Estado: {
                          webgazerStatus === "listo" ? "🎥 Activo" :
                          webgazerStatus === "cargando" ? "Cargando…" :
                          webgazerStatus === "error" ? "⚠️ No se pudo cargar (revisa el permiso de cámara o tu conexión)" :
                          "apagado"
                        }
                      </p>
                      <button onClick={() => setCalibrationOpen(true)} disabled={webgazerStatus !== "listo"} style={{
                        width: "100%", marginBottom: 12, background: webgazerStatus !== "listo" ? "#CFC9BC" : theme.accent,
                        color: highContrast ? "#000" : "#fff", border: "none", borderRadius: 14, padding: "12px 0",
                        fontSize: 15, fontWeight: 800, cursor: webgazerStatus !== "listo" ? "default" : "pointer",
                      }}>
                        Calibrar mirada
                      </button>
                      <p style={{ fontSize: 13, color: theme.sub, marginBottom: 12 }}>
                        Calibra cada vez que cambie la persona, la posición de la pantalla, o la iluminación del lugar — mejora mucho la precisión.
                      </p>
                    </>
                  )}

                  <label style={labelStyle}>¿Cómo se confirma la selección?</label>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                    <button onClick={() => setConfirmMode("dwell")} style={chipStyle(confirmMode === "dwell", highContrast)}>
                      Mirar fijo (tiempo de espera)
                    </button>
                    <button onClick={() => setConfirmMode("parpadeo")} style={chipStyle(confirmMode === "parpadeo", highContrast)}>
                      Parpadeo sostenido
                    </button>
                  </div>

                  {confirmMode === "dwell" && (
                    <>
                      <label style={labelStyle}>
                        Tiempo para seleccionar al mirar fijo: {(dwellTime / 1000).toFixed(1)}s
                      </label>
                      <input type="range" min="400" max="2500" step="100" value={dwellTime}
                        onChange={(e) => setDwellTime(parseInt(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
                      <p style={{ fontSize: 13, color: theme.sub }}>
                        Más corto selecciona más rápido pero puede activar cosas por accidente. Más largo es más seguro pero más lento.
                      </p>
                    </>
                  )}

                  {confirmMode === "parpadeo" && (
                    <>
                      <p style={{ fontSize: 13, color: theme.sub, marginBottom: 10 }}>
                        Mueve el puntero como ya tienes configurado, y para elegir cierra los ojos a propósito y mantenlos cerrados.
                        Usa una cámara propia para ver tu rostro (puede ser la misma webcam, además de cualquier eye-tracker que mueva el puntero).
                        {" "}Estado: {
                          faceMeshStatus === "listo" ? "🎥 Activo" :
                          faceMeshStatus === "cargando" ? "Cargando…" :
                          faceMeshStatus === "sin-rostro" ? "⚠️ No se detecta tu rostro" :
                          faceMeshStatus === "error" ? "⚠️ No se pudo usar la cámara" :
                          "apagado"
                        }
                      </p>
                      <button onClick={() => setBlinkCalibrationOpen(true)} style={{
                        width: "100%", marginBottom: 12, background: theme.accent,
                        color: highContrast ? "#000" : "#fff", border: "none", borderRadius: 14, padding: "12px 0",
                        fontSize: 15, fontWeight: 800, cursor: "pointer",
                      }}>
                        Practicar / ajustar parpadeo
                      </button>
                      <p style={{ fontSize: 13, color: theme.sub }}>
                        Tiempo de parpadeo sostenido actual: {(blinkHoldMs / 1000).toFixed(2)}s. Ajústalo en la práctica viendo el medidor en vivo.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            <button onClick={() => setSettingsOpen(false)} style={{
              width: "100%", marginTop: 8, background: theme.accent, color: highContrast ? "#000" : "#fff",
              border: "none", borderRadius: 16, padding: "14px 0", fontSize: 17, fontWeight: 800, cursor: "pointer",
            }}>
              Guardar y cerrar
            </button>
          </div>
        </div>
      )}

      {/* ====================== AGREGAR PALABRA NUEVA ====================== */}
      {addWordOpen && (
        <div role="dialog" aria-label="Agregar palabra nueva" style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex",
          alignItems: "flex-end", justifyContent: "center", zIndex: 60,
        }} onClick={() => setAddWordOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: highContrast ? "#0A0A0A" : "#fff", color: theme.text, width: "100%", maxWidth: 480,
            borderRadius: "22px 22px 0 0", padding: 22, border: highContrast ? "2px solid #fff" : "none",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>Agregar palabra nueva</h2>
              <button onClick={() => setAddWordOpen(false)} aria-label="Cerrar" style={iconBtnStyle("#5A554C", false)}>
                <X size={22} />
              </button>
            </div>

            <label style={labelStyle}>Palabra o frase</label>
            <input type="text" value={newWordText} onChange={(e) => setNewWordText(e.target.value)}
              placeholder="Ej: Pizza, Abuela, Quiero ver tele…" style={selectStyle(highContrast)} autoFocus />

            <label style={labelStyle}>Emoji o ícono (opcional)</label>
            <input type="text" value={newWordEmoji} onChange={(e) => setNewWordEmoji(e.target.value)}
              placeholder="⭐" style={{ ...selectStyle(highContrast), fontSize: 22, textAlign: "center" }} maxLength={4} />

            <label style={labelStyle}>Categoría</label>
            <select value={newWordCat} onChange={(e) => setNewWordCat(e.target.value)} style={selectStyle(highContrast)}>
              {allCategories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>

            <button onClick={addCustomWord} disabled={!newWordText.trim()} style={{
              width: "100%", marginTop: 12, background: !newWordText.trim() ? "#CFC9BC" : theme.accent,
              color: highContrast ? "#000" : "#fff", border: "none", borderRadius: 16, padding: "14px 0",
              fontSize: 17, fontWeight: 800, cursor: !newWordText.trim() ? "default" : "pointer",
            }}>
              Guardar palabra
            </button>
            <p style={{ fontSize: 13, color: theme.sub, marginTop: 10, textAlign: "center" }}>
              Se guarda en el dispositivo y aparece en la categoría elegida, con una "✕" para borrarla cuando quieras.
            </p>
          </div>
        </div>
      )}

      {/* ====================== CREAR MÓDULO / CATEGORÍA NUEVA ====================== */}
      {addCategoryOpen && (
        <div role="dialog" aria-label="Crear módulo nuevo" style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex",
          alignItems: "flex-end", justifyContent: "center", zIndex: 60,
        }} onClick={() => setAddCategoryOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: highContrast ? "#0A0A0A" : "#fff", color: theme.text, width: "100%", maxWidth: 480,
            borderRadius: "22px 22px 0 0", padding: 22, border: highContrast ? "2px solid #fff" : "none",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>Crear módulo nuevo</h2>
              <button onClick={() => setAddCategoryOpen(false)} aria-label="Cerrar" style={iconBtnStyle("#5A554C", false)}>
                <X size={22} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: theme.sub, marginTop: -6, marginBottom: 14 }}>
              Un módulo es como una categoría propia (ej. "Mi rutina", "Mis programas", "Mi escuela") donde luego puedes ir agregando tus palabras favoritas.
            </p>

            <label style={labelStyle}>Nombre del módulo</label>
            <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Ej: Mi rutina, Mis programas…" style={selectStyle(highContrast)} autoFocus />

            <label style={labelStyle}>Emoji o ícono</label>
            <input type="text" value={newCatEmoji} onChange={(e) => setNewCatEmoji(e.target.value)}
              placeholder="🌟" style={{ ...selectStyle(highContrast), fontSize: 22, textAlign: "center" }} maxLength={4} />

            <label style={labelStyle}>Color del módulo</label>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              {THEME_PALETTE.map((t, i) => (
                <button key={i} onClick={() => setNewCatThemeIdx(i)} aria-label={`Elegir color ${i + 1}`}
                  style={{
                    width: 38, height: 38, borderRadius: "50%", background: t.color, cursor: "pointer",
                    border: newCatThemeIdx === i ? `3px solid ${highContrast ? "#FFD60A" : "#1E2326"}` : "3px solid transparent",
                  }} />
              ))}
            </div>

            <button onClick={addCustomCategory} disabled={!newCatName.trim()} style={{
              width: "100%", marginTop: 4, background: !newCatName.trim() ? "#CFC9BC" : theme.accent,
              color: highContrast ? "#000" : "#fff", border: "none", borderRadius: 16, padding: "14px 0",
              fontSize: 17, fontWeight: 800, cursor: !newCatName.trim() ? "default" : "pointer",
            }}>
              Crear módulo
            </button>
            <p style={{ fontSize: 13, color: theme.sub, marginTop: 10, textAlign: "center" }}>
              Después de crearlo, úsalo el botón "➕ Agregar palabra" dentro del módulo para llenarlo de palabras.
            </p>
          </div>
        </div>
      )}

      {/* ====================== PUNTERO DE MIRADA + ANILLO DE CONFIRMACIÓN ====================== */}
      {eyeControl && gazePoint && !calibrationOpen && !blinkCalibrationOpen && (
        <div aria-hidden="true" style={{
          position: "fixed", left: gazePoint.x - 16, top: gazePoint.y - 16, width: 32, height: 32,
          borderRadius: "50%", border: `3px solid ${theme.accent}`, pointerEvents: "none", zIndex: 90,
          background: highContrast ? "rgba(255,214,10,0.15)" : "rgba(194,78,42,0.15)",
        }} />
      )}
      {eyeControl && gazeTargetRect && confirmMode === "dwell" && (
        <div aria-hidden="true" style={{
          position: "fixed", pointerEvents: "none", zIndex: 89,
          left: gazeTargetRect.left - 4, top: gazeTargetRect.top - 4,
          width: gazeTargetRect.width + 8, height: gazeTargetRect.height + 8,
          borderRadius: 22, border: `4px solid ${theme.accent}`,
          clipPath: `inset(0 ${100 - dwellProgress * 100}% 0 0)`,
          transition: "clip-path 0.03s linear",
        }} />
      )}
      {eyeControl && gazeTargetRect && confirmMode === "parpadeo" && (
        <div aria-hidden="true" style={{
          position: "fixed", pointerEvents: "none", zIndex: 89,
          left: gazeTargetRect.left - 4, top: gazeTargetRect.top - 4,
          width: gazeTargetRect.width + 8, height: gazeTargetRect.height + 8,
          borderRadius: 22, border: `4px dashed ${theme.accent}`,
          opacity: 0.35 + blinkProgress * 0.65,
          boxShadow: blinkProgress > 0 ? `0 0 0 ${blinkProgress * 6}px ${theme.accent}33` : "none",
          transition: "opacity 0.05s linear, box-shadow 0.05s linear",
        }} />
      )}
      {eyeControl && confirmMode === "parpadeo" && !blinkCalibrationOpen && (
        <div aria-hidden="true" style={{
          position: "fixed", bottom: 16, right: 16, zIndex: 91, padding: "8px 14px", borderRadius: 999,
          background: highContrast ? "#111" : "#1E2326", color: "#fff", fontSize: 13, fontWeight: 700,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          👁️ {
            faceMeshStatus === "listo" ? "Parpadeo activo" :
            faceMeshStatus === "cargando" ? "Cargando…" :
            faceMeshStatus === "sin-rostro" ? "No veo tu rostro" :
            faceMeshStatus === "error" ? "Error de cámara" : "Apagado"
          }
        </div>
      )}

      {/* ====================== CALIBRACIÓN DE MIRADA (WebGazer) ====================== */}
      {calibrationOpen && (
        <GazeCalibration
          highContrast={highContrast}
          accent={theme.accent}
          onDone={() => setCalibrationOpen(false)}
        />
      )}

      {/* ====================== PRÁCTICA DE PARPADEO ====================== */}
      {blinkCalibrationOpen && (
        <BlinkCalibration
          highContrast={highContrast}
          accent={theme.accent}
          blinkHoldMs={blinkHoldMs}
          setBlinkHoldMs={setBlinkHoldMs}
          blinkProgress={blinkProgress}
          faceMeshStatus={faceMeshStatus}
          onDone={() => setBlinkCalibrationOpen(false)}
        />
      )}
    </div>
  );
}

// ============================================================
// CALIBRACIÓN DE MIRADA
// ============================================================
function GazeCalibration({ highContrast, accent, onDone }) {
  // 9 puntos cubriendo la pantalla; cada uno necesita varios clics para calibrar bien a WebGazer
  const POINTS = [
    [5, 5], [50, 5], [95, 5],
    [5, 50], [50, 50], [95, 50],
    [5, 95], [50, 95], [95, 95],
  ];
  const CLICKS_NEEDED = 5;
  const [pointIndex, setPointIndex] = useState(0);
  const [clicksOnPoint, setClicksOnPoint] = useState(0);

  const handleClick = () => {
    const next = clicksOnPoint + 1;
    if (next >= CLICKS_NEEDED) {
      if (pointIndex + 1 >= POINTS.length) { onDone(); return; }
      setPointIndex((i) => i + 1);
      setClicksOnPoint(0);
    } else {
      setClicksOnPoint(next);
    }
  };

  const [px, py] = POINTS[pointIndex];

  return (
    <div role="dialog" aria-label="Calibración de mirada" style={{
      position: "fixed", inset: 0, background: highContrast ? "#000" : "#FAF8F4", zIndex: 100,
    }}>
      <p style={{
        position: "absolute", top: 24, left: 0, right: 0, textAlign: "center",
        fontSize: 17, fontWeight: 700, color: highContrast ? "#fff" : "#1E2326", padding: "0 24px",
      }}>
        Mira el círculo y haz clic sobre él {CLICKS_NEEDED} veces. Punto {pointIndex + 1} de {POINTS.length}.
      </p>
      <button
        onClick={handleClick}
        aria-label="Punto de calibración"
        style={{
          position: "absolute", left: `${px}%`, top: `${py}%`, transform: "translate(-50%, -50%)",
          width: 46, height: 46, borderRadius: "50%", background: accent,
          border: highContrast ? "3px solid #fff" : "3px solid #fff",
          boxShadow: "0 0 0 6px rgba(194,78,42,0.25)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 800, fontSize: 14,
        }}>
        {clicksOnPoint}/{CLICKS_NEEDED}
      </button>
      <button onClick={onDone} style={{
        position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
        background: "none", border: "none", color: highContrast ? "#CFCFCF" : "#9A958C",
        fontSize: 14, fontWeight: 600, textDecoration: "underline", cursor: "pointer",
      }}>
        Saltar calibración
      </button>
    </div>
  );
}

// ============================================================
// PRÁCTICA / AJUSTE DE PARPADEO
// ============================================================
function BlinkCalibration({ highContrast, accent, blinkHoldMs, setBlinkHoldMs, blinkProgress, faceMeshStatus, onDone }) {
  return (
    <div role="dialog" aria-label="Practicar parpadeo" style={{
      position: "fixed", inset: 0, background: highContrast ? "#000" : "#FAF8F4", zIndex: 100,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <p style={{ fontSize: 18, fontWeight: 700, color: highContrast ? "#fff" : "#1E2326", textAlign: "center", maxWidth: 420, marginBottom: 28 }}>
        Cierra los ojos a propósito y mantenlos cerrados hasta que el círculo se llene por completo. Parpadeos normales y rápidos no deben llenarlo.
      </p>

      <div style={{
        width: 160, height: 160, borderRadius: "50%", position: "relative",
        border: `6px solid ${highContrast ? "#333" : "#EFEAE0"}`, marginBottom: 24,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          position: "absolute", inset: -6, borderRadius: "50%",
          border: `6px solid ${accent}`,
          clipPath: `inset(${100 - blinkProgress * 100}% 0 0 0)`,
          transition: "clip-path 0.05s linear",
        }} />
        <span style={{ fontSize: 46 }}>{blinkProgress > 0.05 ? "😑" : "👁️"}</span>
      </div>

      <p style={{ fontSize: 14, fontWeight: 700, color: highContrast ? "#CFCFCF" : "#9A958C", marginBottom: 18 }}>
        {faceMeshStatus === "listo" ? "🎥 Detectando tu rostro" :
         faceMeshStatus === "cargando" ? "Cargando…" :
         faceMeshStatus === "sin-rostro" ? "⚠️ No veo tu rostro, acércate o mejora la luz" :
         faceMeshStatus === "error" ? "⚠️ No se pudo usar la cámara" : "Apagado"}
      </p>

      <div style={{ width: "100%", maxWidth: 360 }}>
        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 4, color: highContrast ? "#CFCFCF" : "#9A958C" }}>
          Tiempo de parpadeo sostenido necesario: {(blinkHoldMs / 1000).toFixed(2)}s
        </label>
        <input type="range" min="250" max="1200" step="50" value={blinkHoldMs}
          onChange={(e) => setBlinkHoldMs(parseInt(e.target.value))} style={{ width: "100%", marginBottom: 8 }} />
        <p style={{ fontSize: 13, color: highContrast ? "#CFCFCF" : "#9A958C" }}>
          Si el círculo se llena con parpadeos normales, sube el tiempo. Si cuesta mucho mantenerlo, bájalo.
        </p>
      </div>

      <button onClick={onDone} style={{
        marginTop: 28, background: accent, color: highContrast ? "#000" : "#fff", border: "none",
        borderRadius: 16, padding: "14px 28px", fontSize: 16, fontWeight: 800, cursor: "pointer",
      }}>
        Listo, terminar práctica
      </button>
    </div>
  );
}

// ============================================================
// COMPONENTES Y ESTILOS AUXILIARES
// ============================================================
function SectionTitle({ icon: Icon, text, sub }) {
  return (
    <div style={{ margin: "16px 0 8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800 }}>
        <Icon size={18} />{text}
      </div>
      {sub && <p style={{ fontSize: 13, color: "#9A958C", margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

function ToggleRow({ checked, onChange, label, highContrast, accent }) {
  return (
    <button onClick={() => onChange(!checked)} role="switch" aria-checked={checked} style={{
      display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", cursor: "pointer", padding: "4px 0",
    }}>
      <span style={{
        width: 50, height: 28, borderRadius: 14, background: checked ? accent : (highContrast ? "#444" : "#ddd"),
        position: "relative", transition: "background 0.15s", flexShrink: 0,
      }}>
        <span style={{
          position: "absolute", top: 3, left: checked ? 25 : 3, width: 22, height: 22, borderRadius: "50%",
          background: "#fff", transition: "left 0.15s",
        }} />
      </span>
      <span style={{ fontSize: 15, fontWeight: 600 }}>{label}</span>
    </button>
  );
}

function iconBtnStyle(bg, disabled) {
  return {
    width: 52, background: disabled ? "#CFC9BC" : bg, color: "#fff", border: "none", borderRadius: 14,
    display: "flex", alignItems: "center", justifyContent: "center", cursor: disabled ? "default" : "pointer", flexShrink: 0,
  };
}
function selectStyle(highContrast) {
  return {
    width: "100%", padding: "12px 14px", borderRadius: 12, fontSize: 15, fontWeight: 600, marginBottom: 4,
    border: highContrast ? "2px solid #fff" : "1px solid #ddd", background: highContrast ? "#111" : "#fafafa",
    color: highContrast ? "#fff" : "#1E2326",
  };
}
function chipStyle(active, highContrast) {
  return {
    padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 700, cursor: "pointer",
    border: active ? "2px solid #C24E2A" : (highContrast ? "1px solid #555" : "1px solid #ddd"),
    background: active ? "#FFF3E9" : (highContrast ? "#161616" : "#fafafa"),
    color: active ? "#C24E2A" : (highContrast ? "#fff" : "#1E2326"),
  };
}
const labelStyle = { fontSize: 13, fontWeight: 700, display: "block", marginBottom: 4, color: "#9A958C" };
