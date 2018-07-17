const unirest = require("unirest");

import React, { Component } from "react";
import DownloadImg from "./../components/DownloadImg.js";
import "./../style/List.css";

const configServerURL = require("./../wrangler/settings.js").server_url;

class List extends Component {
  constructor(props) {
    super(props);
    this.state = { files: [] };
    this.getFiles = this.getFiles.bind(this);
  }

  componentDidMount() {
    this.getFiles();
    this.timerID = setInterval(() => this.getFiles(), 5000);
  }

  getFiles() {
    let self = this;
    unirest.get(configServerURL + "files").end(function(response) {
      console.log(response.body);
      self.setState({
        files: response.body
      });
    });
  }

  render() {
    let rows = [];
    rows.push(
      <tr>
        <th className="FilenameHeader">Filename</th>
        <th className="SeedHeader">Seeds</th>
        <th className="DownloadHeader" />
      </tr>
    );
    this.state.files.forEach(function(file) {
      rows.push(
        <tr>
          <td>{file._id}</td>
          <td>{file.size}</td>
          <td className="DownloadElement">
            <DownloadImg filename={file._id} />
          </td>
        </tr>
      );
    });
    return <table className="Table">{rows}</table>;
  }
}

export default List;
