import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import { DragLayer } from 'react-dnd';
import ItemTypes from '../constants/ItemTypes';
import Connection from './Connection';
import SVGComponent from './SVGComponent';

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(props) {
  const { initialSourceOffset, currentSourceOffset } = props;

  let { x, y } = currentSourceOffset;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform: transform,
    WebkitTransform: transform,
    position: 'absolute',
  };
}

function getModifiedScene(props, id) {
  const { currentSourceOffset, initialSourceOffset, item, scenes } = props;

  if (!initialSourceOffset || !currentSourceOffset) {
    return item;
  }

  if (id === item.id) {
    return {
      ...item,
      x: currentSourceOffset.x,
      y: currentSourceOffset.y,
    };
  } else {
    return {
      ...scenes[id]
    }
  }
}

class CustomDragLayer extends Component {
  static propTypes = {
    connections: PropTypes.object,
    currentOffset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
    currentSourceOffset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }),
    initalOffset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
    initialSourceOffset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }),
    isDragging: PropTypes.bool.isRequired,
    item: PropTypes.object,
    itemType: PropTypes.string,
    renderScene: PropTypes.func.isRequired,
    renderSceneHeader: PropTypes.func.isRequired,
    scenes: PropTypes.object,
    viewport: PropTypes.object.isRequired,
  };

  static defaultProps = {
    connections: {},
    item: {},
    itemType: "",
    scenes: {},
  };

  renderConnection(connection, key) {
    const { currentSourceOffset, initialSourceOffset, item } = this.props;

    const fromScene = getModifiedScene(this.props, connection.from);
    const toScene = getModifiedScene(this.props, connection.to);
    const itemIsTarget = item.id === toScene.id;
    const xDelta = currentSourceOffset.x - initialSourceOffset.x;
    const yDelta = currentSourceOffset.y - initialSourceOffset.y;
    const startX = itemIsTarget ?
      connection.startX :
      connection.startX + xDelta;
    const startY = itemIsTarget ?
      connection.startY :
      connection.startY + yDelta;
    return <Connection
      key={key}
      startX={startX}
      startY={startY}
      endingScene={toScene}
    />
  }

  renderConnectionBeingDragged = () => {
    const { currentOffset, initialOffset, viewport } = this.props;

    return (
      <div style={layerStyles}>
        <SVGComponent width={viewport.width} height={viewport.height}>
          <Connection
            startX={initialOffset.x}
            startY={initialOffset.y}
            endX={currentOffset.x}
            endY={currentOffset.y}
          />
        </SVGComponent>
      </div>
    );
  }

  render() {
    const {
      connections,
      currentSourceOffset,
      isDragging,
      initialSourceOffset,
      item,
      itemType,
      renderScene,
      renderSceneHeader,
      viewport,
    } = this.props;

    if (!isDragging || !currentSourceOffset || !initialSourceOffset) {
      return null;
    }

    if(itemType === ItemTypes.CONNECTION) {
      return this.renderConnectionBeingDragged();
    }

    const connectionsInMotion = _.filter(connections, (connection) => {
      return [connection.from, connection.to].includes(item.id);
    });

    const itemStyle = getItemStyles(this.props);
    return (
      <div style={layerStyles}>
        <div style={itemStyle}>
          {renderSceneHeader(item)}
          {renderScene(item)}
        </div>
        <SVGComponent width={viewport.width} height={viewport.height}>
          {Object.keys(connectionsInMotion)
            .map(key => this.renderConnection(connectionsInMotion[key], key))
          }
        </SVGComponent>
      </div>
    );
  }
}

export default DragLayer(monitor => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  initialOffset: monitor.getInitialClientOffset(),
  initialSourceOffset: monitor.getInitialSourceClientOffset(),
  currentOffset: monitor.getClientOffset(),
  currentSourceOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging()
}))(CustomDragLayer)
