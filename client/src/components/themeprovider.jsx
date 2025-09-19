import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

export default function ThemeProvider({ children }) {
  const { theme } = useSelector((state) => state.theme);
  const cssVars = theme === 'light'
    ? { '--header-bg': '#f8fafc', '--header-fg': '#1f2937' }
    : { '--header-bg': 'rgb(16,23,42)', '--header-fg': '#e5e7eb' };
  return (
    <div className={theme} style={cssVars}>
      <div className='bg-white text-gray-700 dark:text-gray-200 dark:bg-[rgb(16,23,42)] min-h-screen'>
        {children}
      </div>
    </div>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node,
};