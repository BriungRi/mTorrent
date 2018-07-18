import React, { Component } from "react";
import DownloadImg from "./../components/DownloadImg.js";
import "./../style/List.css";

const unirest = require("unirest");
const configServerURL = require("./../settings.js").server_url;

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
    unirest.get(configServerURL + "files").end(function(res) {
      if (res.error) {
        console.log(res.error.message);
      } else {
        self.setState({
          files: res.body
        });
      }
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
