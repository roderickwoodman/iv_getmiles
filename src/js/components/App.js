import React, { Component } from "react";
import ReactDOM from "react-dom";
import Reward from "./Reward";
import CategoryAssignments from "./CategoryAssignments";


const allRewards = ['R1', 'R2', 'R3', 'R4', 'R5'];
const allCategories = ['C1', 'C2', 'C3', 'C4', 'C5'];

class App extends Component {

    constructor() {
        super();

        this.state = {
            categoryMembership: {
                C1: ['R1'],
                C2: ['R2'],
                C3: ['R2', 'R4'],
                C4: ['R3'],
                C5: ['R5']
            },
            overColumn: "",
            beingDragged: "",
            commandHistory: [],
            undoHistory: []
        };

        this.onMouseoverCategory = this.onMouseoverCategory.bind(this);
        this.onMouseleaveCategory = this.onMouseleaveCategory.bind(this);
        this.onClickReward = this.onClickReward.bind(this);
        this.onReleaseReward = this.onReleaseReward.bind(this);
        this.onDeleteReward = this.onDeleteReward.bind(this);
        this.onSaveMembership = this.onSaveMembership.bind(this);
        this.onResetMembership = this.onResetMembership.bind(this);
        this.onUndo = this.onUndo.bind(this);
        this.onRedo = this.onRedo.bind(this);
    }

    componentDidMount() {
        const stored_categoryMembership = JSON.parse(localStorage.getItem('categoryMembership'))
        if (stored_categoryMembership !== null) {
            this.setState({ categoryMembership: stored_categoryMembership });
        }
    }

    componentDidUpdate() {
        let root = document.getElementById('container')
        root.addEventListener('onmouseup', this.onReleaseReward);
    }

    onMouseoverCategory(event, category_name) {
        let new_overColumn = (this.state.beingDragged !== "") ? category_name : "";
        this.setState({ overColumn: new_overColumn });
    }

    onMouseleaveCategory(event, category_name) {
        let new_overColumn = "";
        this.setState({ overColumn: new_overColumn });
    }

    onClickReward(event, reward_name, category_name) {
        event.preventDefault();
        let new_beingDragged = category_name + reward_name;
        window.addEventListener('mouseup', this.onReleaseReward)
        this.setState({ beingDragged: new_beingDragged });
    }

    onReleaseReward(event) {
        window.removeEventListener('mouseup', this.onReleaseReward)
        this.setState(prevState => {
            let updated_categoryMembership = JSON.parse(JSON.stringify(prevState.categoryMembership));
            let updated_commandHistory = JSON.parse(JSON.stringify(prevState.commandHistory))
            if (prevState.overColumn !== 'C0' && prevState.overColumn !== '') {

                // add reward
                let releasing_reward = prevState.beingDragged.substring(2);
                let column_to_modify = prevState.overColumn;
                if (!updated_categoryMembership[column_to_modify].includes(releasing_reward)){
                    updated_categoryMembership[column_to_modify].push(releasing_reward);
                    updated_categoryMembership[column_to_modify] = updated_categoryMembership[column_to_modify].sort()
                }

                // remove previous reward (optional)
                let target_to_move = (prevState.beingDragged.substring(0,2) === 'C0') ? null : prevState.beingDragged
                if (target_to_move !== null) {
                    let updated_rewardList = [...updated_categoryMembership[target_to_move.substring(0,2)]].filter( reward => reward !== target_to_move.substring(2) );
                    updated_categoryMembership[target_to_move.substring(0,2)] = updated_rewardList;
                }

                // update history
                let new_command = {
                    action: (target_to_move === null) ? 'add' : 'move',
                    target: column_to_modify + releasing_reward,
                    moved: (target_to_move === null) ? null : target_to_move
                }
                updated_commandHistory.push(new_command)
            }
            return { 
                categoryMembership: updated_categoryMembership,
                commandHistory: updated_commandHistory,
                beingDragged: "",
                overColumn: ""
            };
        })
    }

    onDeleteReward(event, reward_name, category_name) {
        this.setState(prevState => {

            // delete reward
            let updated_categoryMembership = JSON.parse(JSON.stringify(prevState.categoryMembership));
            let updated_rewardList = [...updated_categoryMembership[category_name]].filter( reward => reward !== reward_name );
            updated_categoryMembership[category_name] = updated_rewardList;

            // update history
            let updated_commandHistory = JSON.parse(JSON.stringify(prevState.commandHistory))
            let new_command = {
                action: 'delete',
                target: category_name + reward_name,
                moved: null
            }
            updated_commandHistory.push(new_command)

            return { 
                categoryMembership: updated_categoryMembership,
                commandHistory: updated_commandHistory
            };
        })
    }

    onSaveMembership(event) {
        localStorage.setItem('categoryMembership', JSON.stringify(this.state.categoryMembership));
    }

    onResetMembership(event) {
        this.setState(prevState => {
            let new_categoryMembership = {};
            allCategories.forEach( function(category) {
                new_categoryMembership[category] = [];
            })
            return { categoryMembership: new_categoryMembership };
        })
    }

    onUndo() {
        this.setState(prevState => {
            let updated_commandHistory = JSON.parse(JSON.stringify(prevState.commandHistory))
            let updated_undoHistory = JSON.parse(JSON.stringify(prevState.undoHistory))
            let updated_categoryMembership = JSON.parse(JSON.stringify(prevState.categoryMembership));
            let num_commands = prevState.commandHistory.length
            if (num_commands) {
                let undo_command = prevState.commandHistory[num_commands - 1]
                let undo_action = undo_command.action;
                let undo_target = undo_command.target;
                let undo_target_category = undo_target.substring(0,2);
                let undo_target_reward = undo_target.substring(2);

                // update undo history
                let new_undo_command = {
                    action: undo_action,
                    target: undo_target_category + undo_target_reward,
                    moved: (undo_action === 'move') ? undo_command.moved : null
                }
                updated_undoHistory.push(new_undo_command)

                // undo the action
                if (undo_action === 'add' || undo_action === 'move') {
                    updated_categoryMembership[undo_target_category] = updated_categoryMembership[undo_target_category].filter (reward => reward !== undo_target_reward);
                }
                if (undo_action === 'delete' || undo_action === 'move') {
                    let to_delete = (undo_action === 'delete') ? undo_target : undo_command.moved;
                    let new_membership = JSON.parse(JSON.stringify(updated_categoryMembership[to_delete.substring(0,2)]))
                    new_membership.push(to_delete.substring(2));
                    updated_categoryMembership[to_delete.substring(0,2)] = new_membership;
                }
                updated_commandHistory.pop()
            }
            return { 
                commandHistory: updated_commandHistory,
                undoHistory: updated_undoHistory,
                categoryMembership: updated_categoryMembership
            }
        })
    }

    onRedo() {
        this.setState(prevState => {
            let updated_commandHistory = JSON.parse(JSON.stringify(prevState.commandHistory))
            let updated_undoHistory = JSON.parse(JSON.stringify(prevState.undoHistory))
            let updated_categoryMembership = JSON.parse(JSON.stringify(prevState.categoryMembership));
            let num_commands = prevState.undoHistory.length
            if (num_commands) {
                let redo_command = prevState.undoHistory[num_commands - 1]
                let redo_action = redo_command.action
                let redo_target_category = redo_command.target.substring(0,2);
                let redo_target_reward = redo_command.target.substring(2);

                // update command history
                let new_command = {
                    action: redo_action,
                    target: redo_target_category + redo_target_reward,
                    moved: (redo_action === 'move') ? redo_command.moved : null
                }
                updated_commandHistory.push(new_command)

                // redo the action
                if (redo_action === 'delete' || redo_action === 'move') {
                    let to_delete = (redo_action === 'delete') ? redo_target : redo_command.moved;
                    updated_categoryMembership[to_delete.substring(0,2)] = updated_categoryMembership[to_delete.substring(0,2)].filter (reward => reward !== to_delete.substring(2));
                }
                if (redo_action === 'add' || redo_action === 'move') {
                    let new_membership = JSON.parse(JSON.stringify(updated_categoryMembership[redo_target_category]))
                    new_membership.push(redo_target_reward);
                    updated_categoryMembership[redo_target_category] = new_membership;
                }
                updated_undoHistory.pop()
            }
            return { 
                commandHistory: updated_commandHistory,
                undoHistory: updated_undoHistory,
                categoryMembership: updated_categoryMembership
            }
        })
    }

    render() {
        return (
            <div id="page-wrapper">
                <div id="visual">

                    <div id="reward-list-header">Rewards:</div>
                    <div id="reward-list">
                        <Reward 
                            key={-1}
                            name={'R0'}
                            categoryname={'C0'}
                            visible={false} />
                        { allRewards.map( (reward_name, i) =>
                            <Reward 
                                key={i}
                                name={reward_name}
                                categoryname={'C0'}
                                targeting={this.state.beingDragged.substring(2) === reward_name && this.state.beingDragged.substring(0,1) !== 'C0'}
                                visible={true}
                                deleteable={false}
                                ondelete={this.onDeleteReward}
                                onmousedown={this.onClickReward}
                                onmouseup={this.onReleaseReward} />
                        )}
                    </div>

                    <CategoryAssignments 
                        allrewards={allRewards}
                        membership={this.state.categoryMembership}
                        beingdragged={this.state.beingDragged}
                        overcolumn={this.state.overColumn}
                        ondeletereward={this.onDeleteReward}
                        onclickreward={this.onClickReward}
                        onreleasereward={this.onReleaseReward}
                        onmouseovercategory={this.onMouseoverCategory}
                        onmouseleavecategory={this.onMouseleaveCategory} />

                    <div id="button-group">
                        <button onClick={ (e) => this.onSaveMembership(e) }>Save</button>
                        <button onClick={ (e) => this.onResetMembership(e) }>Reset</button>
                        <button onClick={ (e) => this.onUndo(e) }>Undo</button>
                        <button onClick={ (e) => this.onRedo(e) }>Redo</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;

const wrapper = document.getElementById("container");
wrapper ? ReactDOM.render(<App />, wrapper) : false;