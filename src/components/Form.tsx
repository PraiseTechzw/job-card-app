import React from 'react';
import styles from './Form.module.css';

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, children, required }) => (
  <div className={styles.formGroup}>
    <label className={styles.label}>
      {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
    </label>
    {children}
    {error && <div className={styles.error}>{error}</div>}
  </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input: React.FC<InputProps> = ({ error, ...props }) => (
  <input className={`${styles.input} ${error ? styles.errorInput : ''}`} {...props} />
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ error, ...props }) => (
  <textarea className={`${styles.textarea} ${error ? styles.errorInput : ''}`} {...props} />
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ error, options, ...props }) => (
  <select className={`${styles.select} ${error ? styles.errorInput : ''}`} {...props}>
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

interface CheckboxGroupProps {
  options: string[];
  selectedValues: string[];
  onChange: (value: string) => void;
  label?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ options, selectedValues, onChange, label }) => (
  <div className={styles.formGroup}>
    {label && <label className={styles.label}>{label}</label>}
    <div className={styles.checkboxGrid}>
      {options.map((opt) => (
        <label key={opt} className={styles.checkboxItem}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={selectedValues.includes(opt)}
            onChange={() => onChange(opt)}
          />
          {opt}
        </label>
      ))}
    </div>
  </div>
);

interface RadioGroupProps {
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
  name: string;
  disabled?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ options, selectedValue, onChange, name, disabled }) => (
  <div className={styles.radioGroup}>
    {options.map((opt) => (
      <label key={opt.value} className={`${styles.radioItem} ${disabled ? styles.disabled : ''}`}>
        <input
          type="radio"
          name={name}
          className={styles.radioInput}
          value={opt.value}
          checked={selectedValue === opt.value}
          onChange={() => onChange(opt.value)}
          disabled={disabled}
        />
        {opt.label}
      </label>
    ))}
  </div>
);
