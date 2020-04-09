import React, { Component } from "react";
import PropTypes from "prop-types";
import Row from "./Row";
import { Parser as FormulaParser } from "hot-formula-parser";

export default class Table extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {},
    };

    this.parser = new FormulaParser();

    this.parser.on("callCellValue", (cellCoord, done) => {
      const x = cellCoord.column.index + 1;
      const y = cellCoord.row.index + 1;

      if (x > this.props.x || y > this.props.y) {
        throw this.parser.Error(this.parser.ERROR_NOT_AVAILABLE);
      }

      if (!this.state.data[y] || !this.state.data[y][x]) {
        return done("");
      }

      return done(this.state.data[y][x]);
    });

    this.parser.on("callRangeValue", (startCellCoord, endCellCoord, done) => {
      const sx = startCellCoord.column.index + 1;
      const sy = startCellCoord.row.index + 1;
      const ex = endCellCoord.column.index + 1;
      const ey = endCellCoord.row.index + 1;
      const fragment = [];

      for (let y = sy; y <= ey; y += 1) {
        const row = this.state.data[y];
        if (!row) {
          continue;
        }

        const colFragment = [];

        for (let x = sx; x <= ex; x += 1) {
          let value = row[x];
          if (!value) {
            value = "";
          }

          if (value.startsWith("=")) {
            const res = this.executeFormula({ x, y }, value.slice(1));
            if (res.error) {
              throw this.parser.Error(res.error);
            }
            value = res.result;
          }
          colFragment.push(value);
        }
        fragment.push(colFragment);
      }
      if (fragment) {
        done(fragment);
      }
    });
  }

  handleChangedCell = ({ x, y }, value) => {
    const modifiedData = Object.assign({}, this.state.data);
    if (!modifiedData[y]) modifiedData[y] = {};
    modifiedData[y][x] = value;
    this.setState({ data: modifiedData });
  };

  updateCells = () => {
    this.forceUpdate();
  };

  executeFormula = (cell, value) => {
    this.parser.cell = cell;
    let res = this.parser.parse(value);
    if (res.error != null) {
      return res;
    }
    if (res.result.toString().startsWith("=")) {
      res = this.executeFormula(cell, res.result.slice(1));
    }

    return res;
  };

  render() {
    const rows = [];

    for (let y = 0; y < this.props.y + 1; y += 1) {
      const rowData = this.state.data[y] || {};
      rows.push(
        <Row
          handleChangedCell={this.handleChangedCell}
          executeFormula={this.executeFormula}
          updateCells={this.updateCells}
          key={y}
          y={y}
          x={this.props.x + 1}
          rowData={rowData}
        />
      );
    }
    return <div>{rows}</div>;
  }
}

Table.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
};
