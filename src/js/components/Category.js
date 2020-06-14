import React from "react";
import Reward from "./Reward";

const Category = props => {

    let classes = 'category'
    if (props.overcolumn === props.name && !props.rewards.includes(props.beingdragged.substring(2))) {
        classes += ' targeting'
    }
    return (
        <div 
            className={classes}
            onMouseOver={ (e) => props.onmouseover(e, props.name) }
            onMouseLeave={ (e) => props.onmouseleave(e, props.name) }
            >
            <div className="name">{props.name}</div>
            { props.allrewards.map( (possible_reward_name, i) =>
                <Reward
                    key={i}
                    name={possible_reward_name}
                    categoryname={props.name}
                    visible={props.rewards.includes(possible_reward_name)}
                    deleteable={true}
                    targeting={props.beingdragged.substring(2) === possible_reward_name && props.beingdragged.substring(0,2) !== props.name}
                    ondelete={props.ondeletereward}
                    onmousedown={props.onclickreward}
                    onmouseup={props.onreleasereward} />
            )}
        </div>
    )

}

export default Category;