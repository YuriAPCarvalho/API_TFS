"use client";
import { FaChevronDown } from "react-icons/fa";

interface SelectProps {
  name: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
}

export default function SelectComponent({
  name,
  options,
  value = "",
  onChange,
}: SelectProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <div className="flex flex-col gap-1 w-[300px]">
      <label className="font-semibold text-gray-700">{name}</label>
      <div className="relative">
        <select
          className="w-full p-2 border rounded-lg shadow-[4px_4px_6px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-gray-600 appearance-none cursor-pointer"
          value={value}
          onChange={handleChange}
        >
          <option value="" disabled>
            Selecione
          </option>
          {options?.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="w-full h-20 text-gray-700 bg-white hover:bg-secondary hover:text-white transition-all"
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <FaChevronDown></FaChevronDown>
        </div>
      </div>
    </div>
  );
}
