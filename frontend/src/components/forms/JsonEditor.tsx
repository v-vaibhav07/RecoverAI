import { useEffect, useState } from "react";
import Textarea from "../common/Textarea";

// Free-form JSON editor for fields with no fixed backend schema
// (metadata, criteria, provider_response, settings, etc.)
export default function JsonEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Record<string, any> | null | undefined;
  onChange: (val: Record<string, any> | undefined) => void;
}) {
  const [text, setText] = useState(() => (value ? JSON.stringify(value, null, 2) : ""));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(value ? JSON.stringify(value, null, 2) : "");
  }, [value]);

  function handleBlur() {
    if (!text.trim()) {
      onChange(undefined);
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(text);
      onChange(parsed);
      setError(null);
    } catch {
      setError("Invalid JSON — changes not applied");
    }
  }

  return (
    <Textarea
      label={label}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
      error={error ?? undefined}
      rows={5}
      placeholder="{}"
      className="font-mono text-xs"
    />
  );
}
