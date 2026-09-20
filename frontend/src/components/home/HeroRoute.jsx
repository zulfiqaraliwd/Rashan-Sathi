import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

// home → neighbour → store
const ROUTE = 'M56 300 C 140 300 140 200 220 190 S 340 120 420 70';

/**
 * The one "signature" moment of the app: a neighbour's grocery run drawn
 * from home to the store. Plays once on page load. With reduced motion the
 * finished route is shown statically.
 */
const HeroRoute = ({ className = '' }) => {
  const still = usePrefersReducedMotion();

  return (
    <svg
      viewBox="0 0 480 360"
      role="img"
      aria-label="Route of a grocery trip from home to the store"
      className={className}
      fill="none"
    >
      {/* faint street grid */}
      <g stroke="rgb(255 255 255 / 0.06)" strokeWidth="1.5" transform="rotate(-8 240 180)">
        {[60, 130, 200, 270, 340, 410].map((x) => (
          <line key={`v${x}`} x1={x} y1="-20" x2={x} y2="380" />
        ))}
        {[40, 110, 180, 250, 320].map((y) => (
          <line key={`h${y}`} x1="-20" y1={y} x2="500" y2={y} />
        ))}
      </g>

      {/* dotted track */}
      <path
        d={ROUTE}
        stroke="rgb(255 255 255 / 0.22)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 10"
      />

      {/* route being traced */}
      <path
        d={ROUTE}
        pathLength="1"
        stroke="#f7b32b"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="1"
        strokeDashoffset="0"
        className={still ? '' : 'animate-trace'}
      />

      {/* home */}
      <g>
        <circle cx="56" cy="300" r="15" fill="rgb(255 255 255 / 0.12)" />
        <circle cx="56" cy="300" r="7" fill="#fff" />
        <text x="56" y="332" textAnchor="middle" fontSize="17" fontWeight="600" fill="rgb(255 255 255 / 0.75)">
          Your home
        </text>
      </g>

      {/* neighbour waypoint */}
      <g
        className={`origin-center [transform-box:fill-box] ${still ? '' : 'animate-pin'}`}
        style={still ? undefined : { animationDelay: '1.5s' }}
      >
        <circle cx="220" cy="190" r="10" fill="#10432c" stroke="rgb(255 255 255 / 0.8)" strokeWidth="3" />
        <text x="220" y="222" textAnchor="middle" fontSize="17" fontWeight="600" fill="rgb(255 255 255 / 0.75)">
          Neighbour
        </text>
      </g>

      {/* store */}
      <g>
        {!still && (
          <circle
            cx="420"
            cy="70"
            r="14"
            fill="#f7b32b"
            className="origin-center animate-ping-soft [transform-box:fill-box]"
            style={{ animationDelay: '3s' }}
          />
        )}
        <g
          className={`origin-center [transform-box:fill-box] ${still ? '' : 'animate-pin'}`}
          style={still ? undefined : { animationDelay: '2.7s' }}
        >
          <circle cx="420" cy="70" r="15" fill="#f7b32b" />
          <path
            d="M413 66h14l-1.6 10h-10.8L413 66Zm3-3.5a4 4 0 0 1 8 0"
            stroke="#082a1b"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="420" y="104" textAnchor="middle" fontSize="17" fontWeight="700" fill="#fff">
            Store
          </text>
        </g>
      </g>

      {/* the neighbour travelling the route */}
      {!still && (
        <circle r="8" fill="#fff" opacity="0">
          <set attributeName="opacity" to="1" begin="0.5s" />
          <animateMotion
            dur="2.4s"
            begin="0.5s"
            fill="freeze"
            calcMode="spline"
            keyTimes="0;1"
            keyPoints="0;1"
            keySplines="0.65 0 0.35 1"
            path={ROUTE}
          />
          <set attributeName="opacity" to="0" begin="2.95s" />
        </circle>
      )}
    </svg>
  );
};

export default HeroRoute;
