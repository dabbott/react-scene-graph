import React, {Component, PropTypes} from 'react';
import _ from 'lodash';

export default class PureLine extends Component {

  static propTypes = {
    from: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
    to: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
    borderBottom: PropTypes.string,
  };

  render() {
    const from = _.minBy([this.props.from, this.props.to], 'x');
    const to = _.maxBy([this.props.from, this.props.to], 'x');

    const len = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
    const angle = Math.atan((to.y - from.y) / (to.x - from.x));

    const style = {
      position: 'absolute',
      transform: `translate(${from.x - .5 * len * (1 - Math.cos(angle))}px, ${from.y + .5 * len * Math.sin(angle)}px) rotate(${angle}rad)`,
      width: `${len}px`,
      height: `${0}px`,
      borderBottom: this.props.borderBottom || '1px solid black'
    };

    return <div style={style}></div>;
  }
}
