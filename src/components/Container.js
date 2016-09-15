import React, { Component, PropTypes } from 'react';
import { DropTarget } from 'react-dnd';
import shouldPureComponentUpdate from '../utils/shouldPureComponentUpdate';
import update from 'react/lib/update';
import ItemTypes from '../constants/ItemTypes';
import Connection from './Connection';
import DraggableScene from './DraggableScene';
import _ from 'lodash';

class Container extends Component {
  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    connections: PropTypes.object,
    onDragConnectionEnd: PropTypes.func.isRequired,
    onDragConnectionStart: PropTypes.func.isRequired,
    onDragSceneEnd: PropTypes.func.isRequired,
    onTargetlessConnectionDrop: PropTypes.func.isRequired,
    renderScene: PropTypes.func.isRequired,
    renderSceneHeader: PropTypes.func.isRequired,
    scenes: PropTypes.object,
    showConnections: PropTypes.bool.isRequired,
    updateScene: PropTypes.func.isRequired,
    updateConnectionEnd: PropTypes.func.isRequired,
    updateConnectionStart: PropTypes.func.isRequired,
  };

  static defaultProps = {
    connections: {},
    scenes: {},
  };

  state = {
    draggedConnection: {},
    draggedScene: {},
    currentConnectionOrigin: null,
    currentConnectionBox: null,
    sceneHeaderHeight: 0,
  };

  getEndingVertOffset = (connection, toScene) => {
    const connsEndingHere = _.sortBy(_.map(_.filter(this.props.connections, (conn, id) => {
      return conn.to === toScene.id;
    }), 'id'));
    return (1 / (connsEndingHere.length + 1)) * (connsEndingHere.indexOf(connection.id) + 1);
  }

  handleConnectionDragChange = (draggedConnection, isStartingDrag) => {
    this.setState({
      draggedConnection: isStartingDrag ? draggedConnection : {},
    });
  }

  handleDragConnectionStart = (scene, clickAbsolutePosition) => {
    const { onDragConnectionStart } = this.props;
    const { sceneHeaderHeight } = this.state;
    const clickRelativePosition = {
      x: clickAbsolutePosition.x - scene.x,
      y: clickAbsolutePosition.y - scene.y - sceneHeaderHeight,
    };
    const relativeStartLocation = onDragConnectionStart(scene, clickRelativePosition);
    const absoluteStartLocation = _.isEmpty(relativeStartLocation) ? null :
      {
        x: relativeStartLocation.x + scene.x,
        y: relativeStartLocation.y + scene.y + sceneHeaderHeight,
      };

    this.setState({
      currentConnectionOrigin: absoluteStartLocation,
    });
    return absoluteStartLocation;
  }

  handleSceneDragChange = (draggedSceneId, isStartingDrag, delta) => {
    const { onDragSceneEnd, scenes } = this.props;
    const draggedScene = scenes[draggedSceneId];

    if (!isStartingDrag && delta) {
      onDragSceneEnd(draggedScene, delta);
    }

    this.setState({
      draggedScene: isStartingDrag ? draggedScene : {},
    });
  }

  handleSceneHeaderRef = (sceneHeaderHeight) => {
    if(sceneHeaderHeight !== this.state.sceneHeaderHeight){
      this.setState({sceneHeaderHeight});
    }
  }

  renderConnection(connection) {
    const { onTargetedConnectionDrop, onTargetlessConnectionDrop, scenes } = this.props;
    const { draggedConnection, draggedScene } = this.state;
    const fromScene = scenes[connection.from];
    const toScene = scenes[connection.to];
    if ([fromScene.id, toScene.id].includes(draggedScene.id) ||
        connection.id === draggedConnection.id) {
      return null;
    }
    const endingVertOffset = this.getEndingVertOffset(connection, toScene);
    return <Connection
      connection={connection}
      endingScene={toScene}
      endingVertOffset={endingVertOffset}
      key={connection.id}
      onConnectionDragChange={this.handleConnectionDragChange}
      onTargetlessConnectionDrop={onTargetlessConnectionDrop}
    />
  }

  renderDraggableScene(scene) {
    const {
      onDragConnectionEnd,
      onDragConnectionStart,
      onTargetlessConnectionDrop,
      renderScene,
      renderSceneHeader,
      updateConnectionEnd,
      updateConnectionStart,
    } = this.props;

    const { currentConnectionOrigin, draggedScene } = this.state;

    return (
      <DraggableScene
        connectionLocation={currentConnectionOrigin}
        draggedScene={draggedScene}
        key={scene.id}
        onDragConnectionEnd={onDragConnectionEnd}
        onDragConnectionStart={this.handleDragConnectionStart}
        onSceneDragChange={this.handleSceneDragChange}
        onSceneHeaderRef={this.handleSceneHeaderRef}
        onTargetlessConnectionDrop={onTargetlessConnectionDrop}
        renderScene={renderScene}
        renderSceneHeader={renderSceneHeader}
        scene={scene}
        updateConnectionEnd={updateConnectionEnd}
        updateConnectionStart={updateConnectionStart}
      />
    );
  }

  render() {
    const {
      connectDropTarget,
      connections,
      scenes,
      showConnections,
      viewport,
    } = this.props;

    return connectDropTarget(
      <div>
        {Object.keys(scenes)
          .map(key => this.renderDraggableScene(scenes[key]))
        }
        {showConnections && Object.keys(connections)
          .map(key => this.renderConnection(connections[key]))
        }
      </div>
    );
  }
}

export default DropTarget(ItemTypes.SCENE, {}, connect => ({
  connectDropTarget: connect.dropTarget()
}))(Container)
