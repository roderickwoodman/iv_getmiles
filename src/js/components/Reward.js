import React from "react";

const Reward = props =>  {

    let classes = (props.visible) ? 'reward' : 'reward-spacer'
    if (props.targeting && !props.visible) {
        classes += ' targeting'
    }
    return (
        <div 
            id={props.categoryname+props.name}
            className={classes}
            onMouseDown={ (e) => props.onmousedown(e, props.name, props.categoryname) }
            >
            {props.name}
            { props.visible && props.deleteable && 
            <button id={props.name} onClick={ (e) => props.ondelete(e, props.name, props.categoryname) }>x</button>
            }
        </div>
    )

}

export default Reward;