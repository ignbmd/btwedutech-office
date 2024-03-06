import React from 'react'
import ReactDOM from "react-dom";
import CompetitionMap from '../../components/comp-map';

const IndexCompetitionMap = () => {
    return (
        <div className='mx-auto mb-2'>
            <CompetitionMap />
        </div>
    )
}

export default IndexCompetitionMap

if (document.getElementById("competition-map-container")) {
    ReactDOM.render(<IndexCompetitionMap />, document.getElementById("competition-map-container"));
}