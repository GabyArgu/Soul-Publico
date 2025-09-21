// components/WaveSvg.tsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';

const WaveSvg = ({ width = '100%', height = '50% '}) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 1440 120" preserveAspectRatio="xMidYMid slice">
            <Path
                fill="#FFFFFF"
                d="M-1271.73-50.51C-1092.82,111.6-826.2,28.63-636.86-62c54.16-28.83,144.37-74.13,203.05-87.68,39.9-8,125.38-12.58,151.68,12.69v1398.3h-989.6Z" transform="translate(1271.73 156.06)" />
        </Svg>
    );
};

export default WaveSvg;