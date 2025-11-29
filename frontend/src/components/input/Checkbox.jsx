import React, { useEffect, useRef } from 'react';
import styles from './checkbox.module.css';

/**
 * ModernCheckbox
 * Props:
 * - id (string) optional
 * - checked (boolean) controlled
 * - defaultChecked (boolean) uncontrolled
 * - onChange (fn) - receives event
 * - label (node|string) optional
 * - size ('sm'|'md'|'lg') default 'md'
 * - color (string) CSS color/var -- used for check/background
 * - indeterminate (boolean) sets indeterminate state visually
 * - disabled (boolean)
 * - className (string) extra wrapper classes
 */
export default function Checkbox({
  id,
  checked,
  defaultChecked,
  onChange,
  label,
  size = 'md',
  color = 'var(--color-main), #2563eb)',
  indeterminate = false,
  disabled = false,
  className = '',
  ...rest
}) {
  const inputRef = useRef(null);
  const generatedId = useRef(id || `modern-checkbox-${Math.random().toString(36).slice(2,9)}`);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate]);

  const sizeMap = {
    sm: styles.sm,
    md: styles.md,
    lg: styles.lg,
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      inputRef.current && inputRef.current.click();
    }
  };

  return (
    <label
      htmlFor={generatedId.current}
      className={`${styles.wrapper} ${sizeMap[size]} ${disabled ? styles.disabled : ''} ${className}`}
    >
      <input
        {...rest}
        id={generatedId.current}
        ref={inputRef}
        type="checkbox"
        className={styles.input}
        onChange={onChange}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        aria-checked={indeterminate ? 'mixed' : checked}
      />

      <span
        className={styles.control}
        role="checkbox"
        tabIndex={disabled ? -1 : 0}
        aria-checked={indeterminate ? 'mixed' : checked}
        aria-disabled={disabled}
        onKeyDown={handleKeyDown}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.check}>
          <path d="M20.3 6.3c.4.4.4 1 0 1.4L10.7 17.3a1 1 0 01-1.4 0L3.7 11.7a1 1 0 011.4-1.4l4.7 4.7 9.5-9.5c.4-.4 1-.4 1.4 0z" />
        </svg>

        <span className={styles.indicator} aria-hidden="true" />
      </span>

      {label ? <span className={styles.label}>{label}</span> : null}
    </label>
  );
}
