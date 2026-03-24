import PropTypes from "prop-types";

const GridLayout = ({ children, className = "" }) => {
  return (
    <div 
      className={`grid-layout grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      {children}
    </div>
  );
};

GridLayout.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default GridLayout;