const unirest = require("unirest");

import React, { Component } from "react";
import "./../style/List.css";
import cloud_download from "./../assets/cloud_download.png";

const configServerURL = require("./../wrangler/settings.js").server_url;

class List extends Component {
  constructor() {
    super();
    this.state = { files: [] };
    this.getFiles = this.getFiles.bind(this);
    this.downloadFile = this.downloadFile.bind(this);
  }

  componentDidMount() {
    this.getFiles();
  }

  getFiles() {
    unirest.get(configServerURL + "files").end(function(response) {
      this.setState({
        files: response.body
      });
    });
  }

  downloadFile(filenameToDownload) {
    unirest
      .post("http://localhost:3001")
      .headers({
        Accept: "application/json",
        "Content-Type": "application/json"
      })
      .send({ filename: filenameToDownload })
      .end(function(response) {
        console.log(response.body);
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
            <td>file._id</td>
            <td>file.size</td>
            <td className="DownloadElement">
              <img
                className="DownloadImage"
                src={cloud_download}
                alt="Download"
              />
            </td>
          </tr>
      )
    })
    return <div>{rows}</div>;
  }
}

export default List;
