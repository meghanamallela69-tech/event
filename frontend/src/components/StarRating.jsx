import PropTypes from "prop-types";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const StarRating = ({ 
  rating = 0, 
  totalRatings = 0, 
  size = "sm", 
  showCount = true, 
  interactive = false, 
  onRatingChange = null 
}) => {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm", 
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl"
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar 
          key={`full-${i}`} 
          className={`text-yellow-400 ${sizeClasses[size]} ${interactive ? 'cursor-pointer hover:text-yellow-500' : ''}`}
          onClick={() => interactive && onRatingChange && onRatingChange(i + 1)}
        />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <FaStarHalfAlt 
          key="half" 
          className={`text-yellow-400 ${sizeClasses[size]} ${interactive ? 'cursor-pointer hover:text-yellow-500' : ''}`}
          onClick={() => interactive && onRatingChange && onRatingChange(fullStars + 1)}
        />
      );
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaRegStar 
          key={`empty-${i}`} 
          className={`text-gray-300 ${sizeClasses[size]} ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
          onClick={() => interactive && onRatingChange && onRatingChange(fullStars + (hasHalfStar ? 1 : 0) + i + 1)}
        />
      );
    }

    return stars;
  };

  const renderInteractiveStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`${sizeClasses[size]} cursor-pointer transition-colors ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
          }`}
          onClick={() => onRatingChange && onRatingChange(i)}
        />
      );
    }
    return stars;
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {interactive ? renderInteractiveStars() : renderStars()}
      </div>
      {showCount && !interactive && (
        <span className={`text-gray-600 ${sizeClasses[size]} ml-1`}>
          {rating > 0 ? `${rating.toFixed(1)}` : '0.0'}
          {totalRatings > 0 && ` (${totalRatings})`}
        </span>
      )}
    </div>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number,
  totalRatings: PropTypes.number,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  showCount: PropTypes.bool,
  interactive: PropTypes.bool,
  onRatingChange: PropTypes.func,
};

export default StarRating;