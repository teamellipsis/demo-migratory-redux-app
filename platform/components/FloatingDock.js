import React from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';

import { connect } from 'react-redux';
import { changeFloatingDockPosition } from '../actions';

class FloatingDock extends React.Component {
    state = {
        onDrag: false,
    };

    constructor(props) {
        super(props);
        this.floatingDockRef = React.createRef();
    }

    handleOnClick = () => {
        if (!this.state.onDrag) this.props.open();
    };

    handleOnDrag = () => {
        this.setState({
            onDrag: true,
        })
    };

    handleOnStart = () => {
        this.setState({
            onDrag: false,
        })
    };

    handleOnStop = () => {
        const rect = this.floatingDockRef.current.getBoundingClientRect();
        this.props.handleOnStop({ x: rect.x, y: rect.y });
    };

    handleOnContextMenu = (event) => {
        event.preventDefault();
    }

    render() {
        const { floatingDock } = this.props;
        let bounds = false;
        if (this.floatingDockRef.current !== null) {
            const rect = this.floatingDockRef.current.getBoundingClientRect();
            bounds = {
                left: -(rect.width / 2),
                top: -(rect.height / 2),
                right: window.innerWidth - (rect.width / 2),
                bottom: window.innerHeight - (rect.height / 2)
            };
        }
        return (
            <Draggable
                allowAnyClick
                onDrag={this.handleOnDrag}
                onStart={this.handleOnStart}
                onStop={this.handleOnStop}
                defaultPosition={floatingDock.position}
                bounds={bounds}
            >
                <Fab
                    style={{ zIndex: 2147483647, backgroundColor: '#00b8ff80', position: 'fixed' }}
                    aria-label="Add"
                    onClick={this.handleOnClick}
                    onContextMenu={this.handleOnContextMenu}
                    buttonRef={this.floatingDockRef}
                >
                    <SettingsIcon />
                </Fab>
            </Draggable>
        );
    }
}

FloatingDock.propTypes = {
    open: PropTypes.func.isRequired,
    handleOnStop: PropTypes.func.isRequired,
    changeFloatingDockPosition: PropTypes.func.isRequired,
    floatingDock: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    floatingDock: state.floatingDock
});

const mapDispatchToProps = (dispatch) => ({
    handleOnStop: position => dispatch(changeFloatingDockPosition(position)),
    changeFloatingDockPosition: position => dispatch(changeFloatingDockPosition(position)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FloatingDock);
