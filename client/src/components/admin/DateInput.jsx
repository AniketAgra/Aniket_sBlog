import clsx from 'clsx';
import { HiOutlineCalendar } from 'react-icons/hi2';
import PropTypes from 'prop-types';
import styles from './DateInput.module.css';

export default function DateInput({ value, onChange, placeholder, className }) {
  return (
    <div
      className={clsx(
        'relative rounded-lg border border-white/10 bg-white/5 backdrop-blur-md',
        'px-3 transition-colors duration-150',
        'w-[8.5rem] sm:w-40',
        'focus-within:ring-2 focus-within:ring-fuchsia-500/40',
        className,
      )}
    >
      <input
        type="date"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={clsx(
          styles.dateInput,
          'w-full bg-transparent border-0 outline-none',
          'text-sm text-gray-200 placeholder:text-gray-400',
          'focus:ring-0 pr-8',
        )}
      />
      <HiOutlineCalendar
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    </div>
  );
}

DateInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};
