import React, { Component } from "react";
import Category from "./Category";


class CategoryAssignments extends Component {

    constructor() {
        super();

        this.state = {
        };

    }

    render() {
        return (
            <React.Fragment>
                <div id="category-membership-header">Categories:</div>
                <div id="category-membership">
                { Object.entries(this.props.membership).map( (entry, i) =>
                    <Category 
                        key={i}
                        name={entry[0]} 
                        rewards={entry[1].length ? entry[1] : []}
                        allrewards={this.props.allrewards}
                        beingdragged={this.props.beingdragged}
                        overcolumn={this.props.overcolumn}
                        ondeletereward={this.props.ondeletereward} 
                        onclickreward={this.props.onclickreward}
                        onreleasereward={this.props.onreleasereward}
                        onmouseover={this.props.onmouseovercategory}
                        onmouseleave={this.props.onmouseleavecategory} />
                )}
                </div>
            </React.Fragment>
        );
    }
}

export default CategoryAssignments;