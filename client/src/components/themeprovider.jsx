import PropTypes from 'prop-types';

// Dark-only theme provider: removes all light theme logic and forces dark CSS variables/styles
export default function ThemeProvider({ children }) {
  const cssVars = { '--header-bg': 'rgb(16,23,42)', '--header-fg': '#e5e7eb' };
  return (
    <div className="dark" style={cssVars}>
      <div className='min-h-screen text-gray-200 bg-[rgb(16,23,42)]'>
        {children}
      </div>
    </div>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node,
};