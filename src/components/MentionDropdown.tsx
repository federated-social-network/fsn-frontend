import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getConnectionsList } from "../api/api";

interface ConnectedUser {
    user_id: string | null;
    username: string;
    is_remote: boolean;
}


const CONNECTIONS_CACHE_KEY = "fsn_connections_cache";

/** Read cached connections from localStorage (instant). */
function getCachedConnections(): ConnectedUser[] {
    try {
        const raw = localStorage.getItem(CONNECTIONS_CACHE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

/** Write connections to localStorage. */
function setCachedConnections(list: ConnectedUser[]) {
    try {
        localStorage.setItem(CONNECTIONS_CACHE_KEY, JSON.stringify(list));
    } catch { /* quota exceeded — ignore */ }
}

/**
 * Call this once when the app boots (e.g. on Dashboard mount) to
 * pre-fetch and cache connected users for instant mention lookups.
 */
export async function prefetchConnections() {
    try {
        const res = await getConnectionsList();
        const list = Array.isArray(res.data) ? res.data : [];
        setCachedConnections(list);
        return list;
    } catch {
        return getCachedConnections();
    }
}

/**
 * Extracts the @mention query being typed at the cursor position.
 */
function getMentionQuery(text: string, cursorPos: number): string | null {
    const before = text.slice(0, cursorPos);
    const atIdx = before.lastIndexOf("@");
    if (atIdx === -1) return null;
    if (atIdx > 0 && !/\s/.test(before[atIdx - 1])) return null;
    const query = before.slice(atIdx + 1);
    if (/\s/.test(query)) return null;
    return query;
}

/**
 * Calculates the exact pixel coordinates of the cursor within a textarea.
 * Uses a hidden mirror div to replicate the exact text layout.
 */
function getCaretCoordinates(element: HTMLTextAreaElement, position: number) {
    const div = document.createElement('div');
    const style = div.style;
    const computed = window.getComputedStyle(element);

    style.whiteSpace = 'pre-wrap';
    style.wordWrap = 'break-word';
    style.position = 'absolute';
    style.visibility = 'hidden';
    style.overflow = 'hidden';

    // Copy relevant styles
    const properties = [
        'direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
        'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
        'borderStyle', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontSizeAdjust',
        'lineHeight', 'fontFamily', 'textAlign', 'textTransform', 'textIndent',
        'textDecoration', 'letterSpacing', 'wordSpacing', 'tabSize', 'MozTabSize'
    ];
    properties.forEach((prop) => {
        (style as any)[prop] = computed.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
    });

    const textContent = element.value.substring(0, position);
    div.textContent = textContent;

    const span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.';
    div.appendChild(span);

    document.body.appendChild(div);
    const coordinates = {
        top: span.offsetTop + parseInt(computed.borderTopWidth),
        left: span.offsetLeft + parseInt(computed.borderLeftWidth),
        height: parseInt(computed.lineHeight) || span.offsetHeight
    };
    document.body.removeChild(div);
    return coordinates;
}

interface MentionDropdownProps {
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    content: string;
    setContent: (val: string) => void;
}

/**
 * Compact inline @mention dropdown.
 * Reads connections from localStorage for instant results.
 */
export default function MentionDropdown({
    textareaRef,
    content,
    setContent,
}: MentionDropdownProps) {
    // Load from cache instantly, then refresh in background
    const [connections, setConnections] = useState<ConnectedUser[]>(getCachedConnections);
    const [cursorPos, setCursorPos] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [coords, setCoords] = useState<{ top: number, left: number, height: number } | null>(null);

    // On mount: refresh from API in background (cache is already in state)
    useEffect(() => {
        let cancelled = false;
        getConnectionsList()
            .then((res) => {
                if (!cancelled) {
                    const list = Array.isArray(res.data) ? res.data : [];
                    setConnections(list);
                    setCachedConnections(list);
                }
            })
            .catch(() => { });
        return () => { cancelled = true; };
    }, []);

    // Track cursor position
    const updateCursor = useCallback(() => {
        const el = textareaRef.current;
        if (el) setCursorPos(el.selectionStart ?? 0);
    }, [textareaRef]);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        const handler = () => updateCursor();
        el.addEventListener("keyup", handler);
        el.addEventListener("click", handler);
        el.addEventListener("input", handler);
        return () => {
            el.removeEventListener("keyup", handler);
            el.removeEventListener("click", handler);
            el.removeEventListener("input", handler);
        };
    }, [textareaRef, updateCursor]);

    const query = getMentionQuery(content, cursorPos);
    const isActive = query !== null;

    const filtered = isActive
        ? connections.filter((u) =>
            u.username.toLowerCase().includes(query!.toLowerCase())
        )
        : [];

    const showDropdown = isActive && filtered.length > 0;

    // Calculate coords when showing dropdown
    useEffect(() => {
        if (showDropdown && textareaRef.current) {
            const el = textareaRef.current;
            // The @ symbol position
            const atIdx = content.slice(0, cursorPos).lastIndexOf("@");
            if (atIdx !== -1) {
                const c = getCaretCoordinates(el, atIdx);
                // Adjust for textarea scrolling
                c.top -= el.scrollTop;
                c.left -= el.scrollLeft;
                setCoords(c);
            }
        } else {
            setCoords(null);
        }
    }, [showDropdown, content, cursorPos, textareaRef]);

    // eslint-disable-next-line
    useEffect(() => { setSelectedIndex(0); }, [query]);

    const insertMention = useCallback(
        (username: string) => {
            const before = content.slice(0, cursorPos);
            const atIdx = before.lastIndexOf("@");
            const after = content.slice(cursorPos);
            const newContent = before.slice(0, atIdx) + `@${username} ` + after;
            setContent(newContent);
            const newCursorPos = atIdx + username.length + 2;
            requestAnimationFrame(() => {
                const el = textareaRef.current;
                if (el) {
                    el.focus();
                    el.setSelectionRange(newCursorPos, newCursorPos);
                    setCursorPos(newCursorPos);
                }
            });
        },
        [content, cursorPos, setContent, textareaRef]
    );

    useEffect(() => {
        const el = textareaRef.current;
        if (!el || !showDropdown) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" || e.key === "Tab") {
                if (filtered.length > 0) {
                    e.preventDefault();
                    insertMention(filtered[selectedIndex].username);
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                setCursorPos(-1);
            }
        };
        el.addEventListener("keydown", handler);
        return () => el.removeEventListener("keydown", handler);
    }, [showDropdown, filtered, selectedIndex, insertMention, textareaRef]);

    if (!showDropdown || !coords) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 2 }}
                transition={{ duration: 0.1 }}
                className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden"
                style={{
                    top: coords.top + coords.height + 4, // 4px below the @ symbol
                    left: coords.left,
                    minWidth: 180,
                    maxWidth: 260
                }}
            >
                <div className="max-h-[116px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                    {filtered.map((u, i) => (
                        <button
                            key={u.username}
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                insertMention(u.username);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 flex items-center gap-2 transition-colors border-none shadow-none ${i === selectedIndex
                                ? "bg-indigo-50 text-indigo-700"
                                : "hover:bg-gray-50 text-gray-700"
                                }`}
                        >
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                {u.username[0]?.toUpperCase()}
                            </div>
                            <span className="text-xs font-medium truncate">
                                @{u.username}
                            </span>
                            {u.is_remote && (
                                <span className="text-[9px] text-gray-400 ml-auto shrink-0">remote</span>
                            )}
                        </button>
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
